from invoke import task

@task
def validate(c):
    c.run("python scripts/validate_content.py")

@task
def serve(c):
    c.run("bundle exec jekyll serve")

@task
def run(c):
    validate(c)
    serve(c)