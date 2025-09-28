---
layout: page
title: Obfuscation
published: 2025-09-27
description: "Obfuscate python source code (pyobfuscate.py)."
permalink: /tutorials/python/obfuscation
category: python
subcategory: obfuscation
---
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload">
<meta name="referrer" content="no-referrer">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Access-Control-Allow-Origin" content="*">
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
<meta http-equiv="Cross-Origin-Resource-Policy" content="same-origin">
<meta http-equiv="Expect-CT" content="max-age=86400, enforce">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="{{ 'css/main.css' | relative_url }}">
<script src="{{ 'assets/js/copy-to-clipboard.js' | relative_url }}"></script>


---

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>

---

<h1>pyobfuscate.py</h1>

---

```python
#!/usr/bin/env python3
# aMiscreant
"""
pyobfuscate.py (fixed)

- removes docstrings
- renames local variables, function and class names (non-magic, non-builtin)
- preserves names that start with '_' by default
- does NOT rename imported names or explicit module-level exports when requested
- avoids generated-name collisions with original identifiers
- handles comprehension scopes correctly
"""

import ast
import argparse
import json
import sys
from collections import defaultdict

SAFE_NAMES = {'True', 'False', 'None', '__name__', '__file__'} | set(dir(__builtins__))

def short_names():
    import string
    i = 0
    while True:
        suf = "" if i == 0 else str(i)
        for ch in string.ascii_lowercase:
            yield ch + suf
        i += 1

class DefinitionCollector(ast.NodeVisitor):
    def __init__(self):
        self.imported = set()
        self.module_assigns = set()
        self.exports = set()
        self.all_names_literal = None
        self.all_identifiers = set()

    def visit_Import(self, node):
        for alias in node.names:
            name = alias.asname or alias.name.split('.')[0]
            self.imported.add(name)
            self.all_identifiers.add(name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        for alias in node.names:
            if alias.name == '*':
                continue
            name = alias.asname or alias.name
            self.imported.add(name)
            self.all_identifiers.add(name)
        self.generic_visit(node)

    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.module_assigns.add(target.id)
                self.all_identifiers.add(target.id)
            elif isinstance(target, (ast.Tuple, ast.List)):
                for elt in target.elts:
                    if isinstance(elt, ast.Name):
                        self.module_assigns.add(elt.id)
                        self.all_identifiers.add(elt.id)
        # __all__ extraction
        if any(isinstance(t, ast.Name) and t.id == '__all__' for t in node.targets):
            if isinstance(node.value, (ast.List, ast.Tuple)):
                try:
                    out = [el.value for el in node.value.elts if isinstance(el, ast.Constant) and isinstance(el.value, str)]
                    self.all_names_literal = out
                    self.exports.update(out)
                    for v in out: self.all_identifiers.add(v)
                except Exception:
                    pass
        self.generic_visit(node)

    def visit_AnnAssign(self, node):
        target = node.target
        if isinstance(target, ast.Name):
            self.module_assigns.add(target.id)
            self.all_identifiers.add(target.id)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self.all_identifiers.add(node.name)
        # add arg names
        for a in node.args.args + node.args.kwonlyargs:
            if isinstance(a, ast.arg) and a.arg:
                self.all_identifiers.add(a.arg)
        if node.args.vararg and node.args.vararg.arg:
            self.all_identifiers.add(node.args.vararg.arg)
        if node.args.kwarg and node.args.kwarg.arg:
            self.all_identifiers.add(node.args.kwarg.arg)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        self.all_identifiers.add(node.name)
        self.generic_visit(node)

    def visit_Name(self, node):
        if isinstance(node.id, str):
            self.all_identifiers.add(node.id)

class Renamer(ast.NodeTransformer):
    def __init__(self, preserve_private=True, preserve_top=False):
        self.preserve_private = preserve_private
        self.preserve_top = preserve_top
        self.name_gen = short_names()
        self.global_map = {}    # mapping for module-level stores & defs
        self.scope_stack = []   # stack of dicts for local scopes
        self.mappings = {}      # original -> obf
        self.reserved = set(SAFE_NAMES)
        self.imported = set()
        self.module_assigned = set()
        self.exports = set()
        self.all_original_identifiers = set()

    def feed_collector(self, collector: DefinitionCollector):
        self.imported = set(collector.imported)
        self.module_assigned = set(collector.module_assigns)
        self.exports = set(collector.exports)
        self.all_original_identifiers = set(collector.all_identifiers)
        # reserve builtins and imported names
        self.reserved.update(self.imported)
        # avoid generating any short name that equals an existing original identifier
        self.reserved.update(self.all_original_identifiers)
        # if preserve_top requested, mark module assigns and exports as reserved
        if self.preserve_top:
            self.reserved.update(self.module_assigned)
            self.reserved.update(self.exports)

    def _new_name(self, orig):
        if orig in self.mappings:
            return self.mappings[orig]
        new = next(self.name_gen)
        # avoid reserved collisions
        while new in self.reserved:
            new = next(self.name_gen)
        self.mappings[orig] = new
        return new

    def visit_Module(self, node):
        # remove module docstring
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str):
            node.body.pop(0)
        self.generic_visit(node)
        return node

    def _maybe_register_def(self, orig_name, new_name):
        # record new name in global_map so Load occurrences will be rewritten
        if orig_name not in self.global_map:
            self.global_map[orig_name] = new_name

    def visit_FunctionDef(self, node):
        # remove docstring
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str):
            node.body.pop(0)

        can_rename = (not node.name.startswith("__")
                      and (not self.preserve_private or not node.name.startswith("_"))
                      and (not self.preserve_top or node.name not in self.module_assigned)
                      and node.name not in self.imported)

        if can_rename:
            new = self._new_name(node.name)
            # set both node.name and register mapping so calls are updated
            node.name = new
            self._maybe_register_def(node.name if False else list(self.mappings.keys())[-1], new)
            # above line ensures mapping exists; simpler: do:
            # self._maybe_register_def(orig, new) but orig is overwritten - so use mappings dict
            # to ensure global_map has orig->new
            # BUT we need original name; revert:
            orig = None
            # find mapping entry with value==new (there's one)
            for k,v in self.mappings.items():
                if v == new:
                    orig = k; break
            if orig:
                self.global_map[orig] = new

        # handle args
        local_map = {}
        for arg in getattr(node.args, 'args', []) + getattr(node.args, 'kwonlyargs', []):
            if arg.arg and (not arg.arg.startswith("__") and (not self.preserve_private or not arg.arg.startswith("_"))):
                local_map[arg.arg] = self._new_name(arg.arg)
                arg.arg = local_map[arg.arg]

        if node.args.vararg and node.args.vararg.arg:
            a = node.args.vararg.arg
            if not a.startswith("__") and (not self.preserve_private or not a.startswith("_")):
                local_map[a] = self._new_name(a)
                node.args.vararg.arg = local_map[a]
        if node.args.kwarg and node.args.kwarg.arg:
            a = node.args.kwarg.arg
            if not a.startswith("__") and (not self.preserve_private or not a.startswith("_")):
                local_map[a] = self._new_name(a)
                node.args.kwarg.arg = local_map[a]

        self.scope_stack.append(local_map)
        self.generic_visit(node)
        self.scope_stack.pop()
        return node

    def visit_AsyncFunctionDef(self, node):
        return self.visit_FunctionDef(node)

    def visit_ClassDef(self, node):
        if node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str):
            node.body.pop(0)
        can_rename = (not node.name.startswith("__")
                      and (not self.preserve_private or not node.name.startswith("_"))
                      and (not self.preserve_top or node.name not in self.module_assigned)
                      and node.name not in self.imported)
        if can_rename:
            new = self._new_name(node.name)
            node.name = new
            # register global mapping for class name so loads get rewritten
            orig = None
            for k,v in self.mappings.items():
                if v == new:
                    orig = k; break
            if orig:
                self.global_map[orig] = new
        self.generic_visit(node)
        return node

    def visit_Import(self, node):
        for alias in node.names:
            nm = alias.asname or alias.name.split('.')[0]
            self.reserved.add(nm)
        return node

    def visit_ImportFrom(self, node):
        for alias in node.names:
            if alias.name == '*':
                continue
            nm = alias.asname or alias.name
            self.reserved.add(nm)
        return node

    def visit_Assign(self, node):
        # leave RHS processed; LHS handled in visit_Name for Store contexts
        self.generic_visit(node)
        return node

    def _register_store_in_current_scope(self, name):
        if name in SAFE_NAMES or name in self.reserved or name.startswith("__") or (self.preserve_private and name.startswith("_")):
            return None
        if self.scope_stack:
            cur = self.scope_stack[-1]
            if name not in cur:
                cur[name] = self._new_name(name)
            return cur[name]
        else:
            if name not in self.global_map:
                if self.preserve_top and name in self.module_assigned:
                    self.reserved.add(name)
                    return None
                self.global_map[name] = self._new_name(name)
            return self.global_map[name]

    def visit_Name(self, node):
        # STORE: create mapping in current/local scope
        if isinstance(node.ctx, ast.Store):
            new = self._register_store_in_current_scope(node.id)
            if new:
                node.id = new
            return node

        # LOAD: replace with mapped name if mapping exists (search scopes inner->outer)
        if isinstance(node.ctx, ast.Load):
            for s in reversed(self.scope_stack):
                if node.id in s:
                    node.id = s[node.id]
                    return node
            if node.id in self.global_map:
                node.id = self.global_map[node.id]
                return node
            # otherwise leave
            return node

        # DEL
        if isinstance(node.ctx, ast.Del):
            for s in reversed(self.scope_stack):
                if node.id in s:
                    node.id = s[node.id]; return node
            if node.id in self.global_map:
                node.id = self.global_map[node.id]; return node
            return node

        return node

    # handle comprehensions by creating a new scope for their target variables
    def _handle_comprehension(self, node):
        # node is a comprehension node (ListComp, GeneratorExp, SetComp, DictComp)
        # We need a fresh scope mapping for its target names (comprehension.generators[*].target)
        comp_scope = {}
        # collect target names (naive: Name targets, Tuple/List of names)
        def collect_targets(t):
            names = []
            if isinstance(t, ast.Name):
                names.append(t.id)
            elif isinstance(t, (ast.Tuple, ast.List)):
                for e in t.elts:
                    names += collect_targets(e)
            return names
        targets = []
        for gen in getattr(node, 'generators', []):
            targets += collect_targets(gen.target)
        # assign new names for targets
        for tn in targets:
            if tn in SAFE_NAMES or tn in self.reserved or tn.startswith("__") or (self.preserve_private and tn.startswith("_")):
                continue
            comp_scope[tn] = self._new_name(tn)
        # push, visit, pop
        self.scope_stack.append(comp_scope)
        self.generic_visit(node)
        self.scope_stack.pop()
        return node

    def visit_ListComp(self, node): return self._handle_comprehension(node)
    def visit_SetComp(self, node): return self._handle_comprehension(node)
    def visit_GeneratorExp(self, node): return self._handle_comprehension(node)
    def visit_DictComp(self, node): return self._handle_comprehension(node)

    def generic_visit(self, node):
        return super().generic_visit(node)

def obfuscate_source(source, preserve_private=True, preserve_top=False):
    tree = ast.parse(source)
    collector = DefinitionCollector()
    for n in tree.body:
        collector.visit(n)
    ren = Renamer(preserve_private=preserve_private, preserve_top=preserve_top)
    ren.feed_collector(collector)
    new_tree = ren.visit(tree)
    ast.fix_missing_locations(new_tree)
    try:
        import astor
        out = astor.to_source(new_tree)
    except Exception:
        try:
            out = ast.unparse(new_tree)
        except Exception:
            raise RuntimeError("Install `astor` or use Python 3.9+ for ast.unparse")
    return out, ren.mappings

def main():
    p = argparse.ArgumentParser()
    p.add_argument('input', help='input .py file')
    p.add_argument('-o','--output', default=None, help='output file path')
    p.add_argument('--map', default=None, help='write mapping JSON to this path')
    p.add_argument('--no-private', action='store_true', help='do not obfuscate names starting with _')
    p.add_argument('--preserve-top', action='store_true', help='preserve module-level assigned names and exports')
    args = p.parse_args()

    src = open(args.input, 'r', encoding='utf-8').read()
    out, mapping = obfuscate_source(src, preserve_private=not args.no_private, preserve_top=args.preserve_top)
    outpath = args.output or (args.input.replace('.py','') + '_obf.py')
    open(outpath,'w',encoding='utf-8').write(out)
    print("Wrote:", outpath)
    if args.map:
        open(args.map,'w',encoding='utf-8').write(json.dumps(mapping, indent=2))
        print("Mapping written to:", args.map)

if __name__ == '__main__':
    main()
```

---

<style>
  footer {
    display: none;
  }
</style>
