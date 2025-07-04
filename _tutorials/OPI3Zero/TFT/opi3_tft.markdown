---
layout: page
title: 💻 TFT Tutorial
date: 2025-5-29
description: Prevent unauthorized USB devices from compromising your system with defense mechanisms and whitelisting scripts.
permalink: /tutorials/OPI3Zero/TFT/TFT_tutorial
category: opi3zero
subcategory: TFT
copy_to_clipboard: true
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

<p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
<p>{{ page.description }}</p>

---

# 🛠️ Orange Pi Zero 3 + ST7735 SPI Display Guide (Kali Linux, 2025)

> This guide takes you from **zero to a working Python-powered SPI display** on the **Orange Pi Zero 3** using a **ST7735 TFT screen**.

---

## 📦 Prerequisites

- ✅ **Orange Pi Zero 3**
- ✅ **Kali Linux 2024/2025** (or any Armbian/Ubuntu image with recent kernel)
- ✅ **ST7735 SPI TFT display** (128x160 or 128x128 resolution)
- ✅ Wires for SPI:
  - `DC` → PC6
  - `RST` → PC11
  - `BL` (Backlight, optional) → PC9 - _Can be left unconnected_
- ✅ Python 3.9+ with `venv` enabled

---

### TFT to Orange Pi Zero 3 Wiring (Using SPI1)

```g   
    ST7735S Pin	Function	Orange Pi Pin	Pin Name	Notes
    GND	Ground	Pin 6	GND	Ground
    VCC	Power	Pin 1 or 2	3.3V or 5V	3.3V preferred, 5V if marked safe
    SCL	SPI Clock (SCK)	Pin 23	PH6 (SPI1-SCK)	SPI1 Clock
    SDA	SPI Data (MOSI)	Pin 19	PH7 (SPI1-MOSI)	SPI1 MOSI
    CS	Chip Select	Pin 24	PH9 (SPI1-CS)	SPI1 Chip Select
    DC	Data/Command	Pin 11	PC11 (GPIO-75)	Free GPIO for D/C
    RST	Reset	Pin 12	PC6 (GPIO-70)	Free GPIO for Reset
    BLK	Backlight	Pin 1	3.3V	Or tie to GPIO for control
```

---

## ⚙️ Enable SPI1 via Device Tree Overlay

### 1. Decompile the DTB

```bash
dtc -I dtb -O dts -o opi.dts /boot/dtb/sun50i-h618-orangepi-zero3.dtb
```

---

### 2. Edit opi.dts

>Find this block:

```c
&spi1 {
    status = "disabled";
};

And replace it with this example configuration (adjust if needed):

&spi1 {
    status = "okay";

    spidev@0 {
        compatible = "spidev";
        reg = <0>;
        spi-max-frequency = <32000000>;
    };
};
```

---

>💡 This is a visual example. Your real .dts may differ. You may need to enable all spi devices for debugging SPI1 etc.

---

### 3. Recompile the DTS

```bash
dtc -I dts -O dtb -o sun50i-h618-orangepi-zero3.dtb opi.dts
```

---

### 4. Backup and Replace Original DTB

```bash
sudo cp /boot/dtb/sun50i-h618-orangepi-zero3.dtb \
      /boot/dtb/sun50i-h618-orangepi-zero3.dtb.bak
sudo cp sun50i-h618-orangepi-zero3.dtb /boot/dtb/
```

---

### 5. Reboot & Verify SPI Node

```bash
ls -l /dev/spidev*
```

Expected output:

```bash
/dev/spidev0.0
/dev/spidev1.1
```
Test the device with:

```bash
sudo ./spidev_test -D /dev/spidev1.1 -v
```

Expected output:

```bash
spi mode: 0x0
bits per word: 8
max speed: 500000 Hz (500 kHz)
TX | ... @ 00 00 00 ... |
RX | FF FF FF FF FF FF ... |
```

🎯 You’re good if you see data flowing!
🧪 Python SPI Display: "Hello World" on ST7735

---

## 1. Create Virtual Environment & Install Requirements

---

# 💡 REQUIRES root! 
---

```g
python3 -m venv venv
source venv/bin/activate
pip install luma.lcd Pillow OrangePi.GPIO
```

---

## 2. Monkeypatch RPi.GPIO (needed by luma.lcd)

Create a file: opigpio_patch.py

```g
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
import sys
import OPi.GPIO as GPIO
sys.modules['RPi.GPIO'] = GPIO
```

---

## 3. Display Script (screen.py) Refer to the bottom of page if this does not work for you

---

```g
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
import opigpio_patch  # Must be first!
import OPi.GPIO as GPIO
from luma.core.interface.serial import spi
from luma.lcd.device import st7735
from PIL import Image, ImageDraw, ImageFont
import subprocess

GPIO.setmode(GPIO.SUNXI)
GPIO.setwarnings(False)

serial = spi(port=1, device=1, gpio_DC="PC6", gpio_RST="PC11", gpio=GPIO)

device = st7735(
    serial_interface=serial,
    gpio=GPIO,
    gpio_LIGHT="PC9",  # optional backlight pin
    width=160,
    height=128,
    rotate=0
)

font = ImageFont.load_default()

while True:
    img = Image.new('RGB', (160, 128), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)
    output = subprocess.getoutput("uptime")
    draw.text((5, 5), output, font=font, fill=(255, 255, 255))
    device.display(img)
```

---

📂 opi.dts
```g
/dts-v1/;

/ {
	interrupt-parent = <0x01>;
	#address-cells = <0x02>;
	#size-cells = <0x02>;
	model = "OrangePi Zero3";
	compatible = "xunlong,orangepi-zero3", "allwinner,sun50i-h616";

	cpus {
		#address-cells = <0x01>;
		#size-cells = <0x00>;

		cpu@0 {
			compatible = "arm,cortex-a53";
			device_type = "cpu";
			reg = <0x00>;
			enable-method = "psci";
			clocks = <0x02 0x15>;
			clock-latency-ns = <0x3b9b0>;
			#cooling-cells = <0x02>;
			operating-points-v2 = <0x03>;
			cpu-supply = <0x04>;
			status = "okay";
			phandle = <0x06>;
		};

		cpu@1 {
			compatible = "arm,cortex-a53";
			device_type = "cpu";
			reg = <0x01>;
			enable-method = "psci";
			clocks = <0x02 0x15>;
			clock-latency-ns = <0x3b9b0>;
			#cooling-cells = <0x02>;
			operating-points-v2 = <0x03>;
			phandle = <0x07>;
		};

		cpu@2 {
			compatible = "arm,cortex-a53";
			device_type = "cpu";
			reg = <0x02>;
			enable-method = "psci";
			clocks = <0x02 0x15>;
			clock-latency-ns = <0x3b9b0>;
			#cooling-cells = <0x02>;
			operating-points-v2 = <0x03>;
			phandle = <0x08>;
		};

		cpu@3 {
			compatible = "arm,cortex-a53";
			device_type = "cpu";
			reg = <0x03>;
			enable-method = "psci";
			clocks = <0x02 0x15>;
			clock-latency-ns = <0x3b9b0>;
			#cooling-cells = <0x02>;
			operating-points-v2 = <0x03>;
			phandle = <0x09>;
		};
	};

	display-engine {
		compatible = "allwinner,sun50i-h6-display-engine";
		allwinner,pipelines = <0x05>;
		status = "okay";
		phandle = <0x50>;
	};

	reserved-memory {
		#address-cells = <0x02>;
		#size-cells = <0x02>;
		ranges;

		secmon@40000000 {
			reg = <0x00 0x40000000 0x00 0x80000>;
			no-map;
		};
	};

	osc24M-clk {
		#clock-cells = <0x00>;
		compatible = "fixed-clock";
		clock-frequency = <0x16e3600>;
		clock-output-names = "osc24M";
		phandle = <0x0f>;
	};

	pmu {
		compatible = "arm,cortex-a53-pmu";
		interrupts = <0x00 0x8c 0x04 0x00 0x8d 0x04 0x00 0x8e 0x04 0x00 0x8f 0x04>;
		interrupt-affinity = <0x06 0x07 0x08 0x09>;
	};

	psci {
		compatible = "arm,psci-0.2";
		method = "smc";
	};

	timer {
		compatible = "arm,armv8-timer";
		arm,no-tick-in-suspend;
		interrupts = <0x01 0x0d 0xf04 0x01 0x0e 0xf04 0x01 0x0b 0xf04 0x01 0x0a 0xf04>;
	};

	soc {
		compatible = "simple-bus";
		#address-cells = <0x01>;
		#size-cells = <0x01>;
		ranges = <0x00 0x00 0x00 0x40000000>;

		bus@1000000 {
			compatible = "allwinner,sun50i-h616-de33", "allwinner,sun50i-a64-de2";
			reg = <0x1000000 0x400000>;
			allwinner,sram = <0x0a 0x01>;
			#address-cells = <0x01>;
			#size-cells = <0x01>;
			ranges = <0x00 0x1000000 0x400000>;

			clock@8000 {
				compatible = "allwinner,sun50i-h616-de33-clk";
				reg = <0x8000 0x100>;
				clocks = <0x02 0x1d 0x02 0x1e>;
				clock-names = "mod", "bus";
				resets = <0x02 0x01>;
				#clock-cells = <0x01>;
				#reset-cells = <0x01>;
				phandle = <0x0b>;
			};

			mixer@100000 {
				compatible = "allwinner,sun50i-h616-de33-mixer-0";
				reg = <0x100000 0x100000 0x8100 0x40 0x280000 0x20000>;
				clocks = <0x0b 0x00 0x0b 0x06>;
				clock-names = "bus", "mod";
				resets = <0x0b 0x00>;
				phandle = <0x05>;

				ports {
					#address-cells = <0x01>;
					#size-cells = <0x00>;

					port@1 {
						reg = <0x01>;
						phandle = <0x51>;

						endpoint {
							remote-endpoint = <0x0c>;
							phandle = <0x3e>;
						};
					};
				};
			};
		};

		gpu@1800000 {
			compatible = "allwinner,sun50i-h616-mali", "arm,mali-bifrost";
			reg = <0x1800000 0x40000>;
			interrupts = <0x00 0x5f 0x04 0x00 0x60 0x04 0x00 0x61 0x04>;
			interrupt-names = "job", "mmu", "gpu";
			clocks = <0x02 0x23 0x02 0x24>;
			clock-names = "core", "bus";
			resets = <0x02 0x03>;
			status = "disabled";
			mali-supply = <0x0d>;
			phandle = <0x4c>;
		};

		video-codec@1c0e000 {
			compatible = "allwinner,sun50i-h616-video-engine";
			reg = <0x1c0e000 0x2000>;
			clocks = <0x02 0x29 0x02 0x28 0x02 0x33>;
			clock-names = "ahb", "mod", "ram";
			resets = <0x02 0x05>;
			interrupts = <0x00 0x5d 0x04>;
			allwinner,sram = <0x0e 0x01>;
		};

		syscon@3000000 {
			compatible = "allwinner,sun50i-h616-system-control";
			reg = <0x3000000 0x30 0x3000038 0xfc8>;
			#address-cells = <0x01>;
			#size-cells = <0x01>;
			ranges;
			phandle = <0x35>;

			sram@100000 {
				compatible = "mmio-sram";
				reg = <0x100000 0x18000>;
				#address-cells = <0x01>;
				#size-cells = <0x01>;
				ranges = <0x00 0x100000 0x18000>;
				phandle = <0x52>;

				scpi-sram@17c00 {
					compatible = "arm,scp-shmem";
					reg = <0x17c00 0x200>;
					phandle = <0x53>;
				};
			};

			sram@28000 {
				compatible = "mmio-sram";
				reg = <0x28000 0x30000>;
				#address-cells = <0x01>;
				#size-cells = <0x01>;
				ranges = <0x00 0x28000 0x30000>;
				phandle = <0x54>;

				sram-section@0 {
					compatible = "allwinner,sun50i-h616-sram-c", "allwinner,sun50i-a64-sram-c";
					reg = <0x00 0x1e000>;
					phandle = <0x0a>;
				};
			};

			sram@1a00000 {
				compatible = "mmio-sram";
				reg = <0x1a00000 0x200000>;
				#address-cells = <0x01>;
				#size-cells = <0x01>;
				ranges = <0x00 0x1a00000 0x200000>;
				phandle = <0x55>;

				sram-section@0 {
					compatible = "allwinner,sun50i-h616-sram-c1";
					reg = <0x00 0x200000>;
					phandle = <0x0e>;
				};
			};
		};

		clock@3001000 {
			compatible = "allwinner,sun50i-h616-ccu";
			reg = <0x3001000 0x1000>;
			clocks = <0x0f 0x10 0x00 0x10 0x02>;
			clock-names = "hosc", "losc", "iosc";
			#clock-cells = <0x01>;
			#reset-cells = <0x01>;
			phandle = <0x02>;
		};

		efuse@3006000 {
			compatible = "allwinner,sun50i-h616-sid";
			reg = <0x3006000 0x1000>;
			#address-cells = <0x01>;
			#size-cells = <0x01>;
			phandle = <0x56>;

			cpu-speed-grade@00 {
				reg = <0x00 0x02>;
				phandle = <0x4d>;
			};

			thermal-sensor-calibration@14 {
				reg = <0x14 0x08>;
				phandle = <0x48>;
			};

			ephy-calibration@2c {
				reg = <0x2c 0x02>;
				phandle = <0x57>;
			};
		};

		watchdog@30090a0 {
			compatible = "allwinner,sun50i-h616-wdt", "allwinner,sun6i-a31-wdt";
			reg = <0x30090a0 0x20>;
			interrupts = <0x00 0x32 0x04>;
			clocks = <0x0f>;
			status = "okay";
			phandle = <0x58>;
		};

		pwm@300a000 {
			compatible = "allwinner,sun50i-h616-pwm";
			reg = <0x300a000 0x400>;
			clocks = <0x0f 0x02 0x2f>;
			clock-names = "mod", "bus";
			resets = <0x02 0x0a>;
			pwm-number = <0x06>;
			pwm-base = <0x00>;
			sunxi-pwms = <0x11 0x12 0x13 0x14 0x15 0x16>;
			#pwm-cells = <0x03>;
			status = "okay";
			phandle = <0x59>;
		};

		pwm0@0300a000 {
			compatible = "allwinner,sunxi-pwm0";
			phandle = <0x11>;
		};

		pwm1@0300a000 {
			compatible = "allwinner,sunxi-pwm1";
			pinctrl-names = "default";
			pinctrl-0 = <0x17>;
			phandle = <0x12>;
		};

		pwm2@0300a000 {
			compatible = "allwinner,sunxi-pwm2";
			pinctrl-names = "default";
			pinctrl-0 = <0x18>;
			phandle = <0x13>;
		};

		pwm3@0300a000 {
			compatible = "allwinner,sunxi-pwm3";
			pinctrl-names = "default";
			pinctrl-0 = <0x19>;
			phandle = <0x14>;
		};

		pwm4@0300a000 {
			compatible = "allwinner,sunxi-pwm4";
			pinctrl-names = "default";
			pinctrl-0 = <0x1a>;
			phandle = <0x15>;
		};

		pwm5@0300a000 {
			compatible = "allwinner,sunxi-pwm5";
			pinctrl-names = "default";
			pinctrl-0 = <0x1b>;
			phandle = <0x16>;
		};

		pinctrl@300b000 {
			compatible = "allwinner,sun50i-h616-pinctrl";
			reg = <0x300b000 0x400>;
			interrupts = <0x00 0x33 0x04 0x00 0x34 0x04 0x00 0x35 0x04 0x00 0x2b 0x04 0x00 0x36 0x04 0x00 0x37 0x04 0x00 0x38 0x04 0x00 0x39 0x04>;
			clocks = <0x02 0x1a 0x0f 0x10 0x00>;
			clock-names = "apb", "hosc", "losc";
			gpio-controller;
			#gpio-cells = <0x03>;
			interrupt-controller;
			#interrupt-cells = <0x03>;
			phandle = <0x1e>;

			rgmii-pins {
				pins = "PI0", "PI1", "PI2", "PI3", "PI4", "PI5", "PI7", "PI8", "PI9", "PI10", "PI11", "PI12", "PI13", "PI14", "PI15", "PI16";
				function = "emac0";
				drive-strength = <0x28>;
				phandle = <0x36>;
			};

			i2c0-pi-pins {
				pins = "PI5", "PI6";
				function = "i2c0";
				phandle = <0x2c>;
			};

			i2c1-ph-pins {
				pins = "PH0", "PH1";
				function = "i2c1";
				phandle = <0x2d>;
			};

			i2c1-pi-pins {
				pins = "PI7", "PI8";
				function = "i2c1";
				phandle = <0x5a>;
			};

			i2c2-ph-pins {
				pins = "PH2", "PH3";
				function = "i2c2";
				phandle = <0x2e>;
			};

			i2c2-pi-pins {
				pins = "PI9", "PI10";
				function = "i2c2";
				phandle = <0x5b>;
			};

			i2c3-ph-pins {
				pins = "PH4", "PH5";
				function = "i2c3";
				phandle = <0x2f>;
			};

			i2c3-pa-pins {
				pins = "PA10", "PA11";
				function = "i2c3";
				bias-pull-up;
				phandle = <0x5c>;
			};

			i2c4-ph-pins {
				pins = "PH6", "PH7";
				function = "i2c4";
				phandle = <0x30>;
			};

			i2s3-pins {
				pins = "PH5", "PH6", "PH7", "PH8", "PH9";
				function = "i2s3";
				phandle = <0x5d>;
			};

			ir-rx-pin {
				pins = "PH10";
				function = "ir_rx";
				phandle = <0x46>;
			};

			pwm1-ph-pin {
				pins = "PH3";
				function = "pwm1";
				phandle = <0x17>;
			};

			pwm2-ph-pin {
				pins = "PH2";
				function = "pwm2";
				phandle = <0x18>;
			};

			pwm3-ph-pin {
				pins = "PH0";
				function = "pwm3";
				phandle = <0x19>;
			};

			pwm4-ph-pin {
				pins = "PH1";
				function = "pwm4";
				phandle = <0x1a>;
			};

			pwm5-pin {
				pins = "PA12";
				function = "pwm5";
				phandle = <0x1b>;
			};

			pwm1-pi-pin {
				pins = "PI11";
				function = "pwm1";
				phandle = <0x5e>;
			};

			pwm2-pi-pin {
				pins = "PI12";
				function = "pwm2";
				phandle = <0x5f>;
			};

			pwm3-pi-pin {
				pins = "PI13";
				function = "pwm3";
				phandle = <0x60>;
			};

			pwm4-pi-pin {
				pins = "PI14";
				function = "pwm4";
				phandle = <0x61>;
			};

			mmc0-pins {
				pins = "PF0", "PF1", "PF2", "PF3", "PF4", "PF5";
				function = "mmc0";
				drive-strength = <0x1e>;
				bias-pull-up;
				phandle = <0x1c>;
			};

			mmc1-pins {
				pins = "PG0", "PG1", "PG2", "PG3", "PG4", "PG5";
				function = "mmc1";
				drive-strength = <0x1e>;
				bias-pull-up;
				phandle = <0x1f>;
			};

			mmc2-pins {
				pins = "PC0", "PC1", "PC5", "PC6", "PC8", "PC9", "PC10", "PC11", "PC13", "PC14", "PC15", "PC16";
				function = "mmc2";
				drive-strength = <0x1e>;
				bias-pull-up;
				phandle = <0x23>;
			};

			rmii-pins {
				pins = "PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PA8", "PA9";
				function = "emac1";
				drive-strength = <0x28>;
				phandle = <0x38>;
			};

			spi0-pins {
				pins = "PC0", "PC2", "PC4";
				function = "spi0";
				phandle = <0x31>;
			};

			spi0-cs0-pin {
				pins = "PC3";
				function = "spi0";
				phandle = <0x32>;
			};

			spi1-pins {
				pins = "PH6", "PH7", "PH8";
				function = "spi1";
				phandle = <0x33>;
			};

			spi1-cs0-pin {
				pins = "PH5";
				function = "spi1";
				phandle = <0x62>;
			};

			spi1-cs1-pin {
				pins = "PH9";
				function = "spi1";
				phandle = <0x34>;
			};

			uart0-ph-pins {
				pins = "PH0", "PH1";
				function = "uart0";
				phandle = <0x29>;
			};

			uart1-ph-pins {
				pins = "PG6", "PG7";
				function = "uart1";
				phandle = <0x63>;
			};

			uart1-ph-rts-cts-pins {
				pins = "PG8", "PG9";
				function = "uart1";
				phandle = <0x64>;
			};

			uart2-ph-pins {
				pins = "PH5", "PH6";
				function = "uart2";
				phandle = <0x2a>;
			};

			uart2-ph-rts-cts-pins {
				pins = "PH7", "PH8";
				function = "uart2";
				phandle = <0x65>;
			};

			uart2-pi-pins {
				pins = "PI5", "PI6";
				function = "uart2";
				phandle = <0x66>;
			};

			uart3-pi-pins {
				pins = "PI9", "PI10";
				function = "uart3";
				phandle = <0x67>;
			};

			uart4-pi-pins {
				pins = "PI13", "PI14";
				function = "uart4";
				phandle = <0x68>;
			};

			uart5-ph-pins {
				pins = "PH2", "PH3";
				function = "uart5";
				phandle = <0x2b>;
			};
		};

		interrupt-controller@3021000 {
			compatible = "arm,gic-400";
			reg = <0x3021000 0x1000 0x3022000 0x2000 0x3024000 0x2000 0x3026000 0x2000>;
			interrupts = <0x01 0x09 0xf04>;
			interrupt-controller;
			#interrupt-cells = <0x03>;
			phandle = <0x01>;
		};

		mmc@4020000 {
			compatible = "allwinner,sun50i-h616-mmc", "allwinner,sun50i-a100-mmc";
			reg = <0x4020000 0x1000>;
			clocks = <0x02 0x3f 0x02 0x3c>;
			clock-names = "ahb", "mmc";
			resets = <0x02 0x0e>;
			reset-names = "ahb";
			interrupts = <0x00 0x23 0x04>;
			pinctrl-names = "default";
			pinctrl-0 = <0x1c>;
			status = "okay";
			max-frequency = <0x2faf080>;
			cap-sd-highspeed;
			cap-mmc-highspeed;
			mmc-ddr-3_3v;
			cap-sdio-irq;
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			vmmc-supply = <0x1d>;
			cd-gpios = <0x1e 0x05 0x06 0x01>;
			bus-width = <0x04>;
			phandle = <0x69>;
		};

		mmc@4021000 {
			compatible = "allwinner,sun50i-h616-mmc", "allwinner,sun50i-a100-mmc";
			reg = <0x4021000 0x1000>;
			clocks = <0x02 0x40 0x02 0x3d>;
			clock-names = "ahb", "mmc";
			resets = <0x02 0x0f>;
			reset-names = "ahb";
			interrupts = <0x00 0x24 0x04>;
			pinctrl-names = "default";
			pinctrl-0 = <0x1f>;
			status = "okay";
			max-frequency = <0x8f0d180>;
			cap-sd-highspeed;
			cap-mmc-highspeed;
			mmc-ddr-3_3v;
			cap-sdio-irq;
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			vmmc-supply = <0x20>;
			vqmmc-supply = <0x21>;
			mmc-pwrseq = <0x22>;
			bus-width = <0x04>;
			non-removable;
			mmc-ddr-1_8v;
			phandle = <0x6a>;
		};

		mmc@4022000 {
			compatible = "allwinner,sun50i-h616-emmc", "allwinner,sun50i-a100-emmc";
			reg = <0x4022000 0x1000>;
			clocks = <0x02 0x41 0x02 0x3e>;
			clock-names = "ahb", "mmc";
			resets = <0x02 0x10>;
			reset-names = "ahb";
			interrupts = <0x00 0x25 0x04>;
			pinctrl-names = "default";
			pinctrl-0 = <0x23>;
			status = "disabled";
			max-frequency = <0x8f0d180>;
			cap-sd-highspeed;
			cap-mmc-highspeed;
			mmc-ddr-3_3v;
			cap-sdio-irq;
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x6b>;
		};

		dma-controller@3002000 {
			compatible = "allwinner,sun50i-h616-dma";
			reg = <0x3002000 0x1000>;
			interrupts = <0x00 0x2a 0x04>;
			clocks = <0x02 0x2a 0x02 0x32>;
			clock-names = "bus", "mbus";
			dma-channels = <0x10>;
			dma-requests = <0x31>;
			resets = <0x02 0x06>;
			#dma-cells = <0x01>;
			phandle = <0x24>;
		};

		codec@05096000 {
			#sound-dai-cells = <0x00>;
			compatible = "allwinner,sun50i-h616-codec";
			reg = <0x5096000 0x31c>;
			interrupts = <0x00 0x3a 0x04>;
			clocks = <0x02 0x5d 0x02 0x5b 0x02 0x5c>;
			clock-names = "apb", "audio-codec-1x", "audio-codec-4x";
			resets = <0x02 0x24>;
			dmas = <0x24 0x06>;
			dma-names = "tx";
			status = "okay";
			allwinner,audio-routing = "Line Out", "LINEOUT";
			phandle = <0x6c>;
		};

		ahub_dam_plat@5097000 {
			#sound-dai-cells = <0x00>;
			compatible = "allwinner,sunxi-snd-plat-ahub_dam";
			reg = <0x5097000 0x1000>;
			resets = <0x02 0x25>;
			clocks = <0x02 0x5b 0x02 0x5c 0x02 0x5e 0x02 0x5f>;
			clock-names = "clk_pll_audio", "clk_pll_audio_4x", "clk_audio_hub", "clk_bus_audio_hub";
			status = "okay";
			phandle = <0x25>;
		};

		ahub_dam_mach {
			compatible = "allwinner,sunxi-snd-mach";
			soundcard-mach,name = "ahubdam";
			status = "okay";
			phandle = <0x6d>;

			soundcard-mach,cpu {
				sound-dai = <0x25>;
			};

			soundcard-mach,codec {
			};
		};

		ahub1_plat {
			#sound-dai-cells = <0x00>;
			compatible = "allwinner,sunxi-snd-plat-ahub";
			apb_num = <0x01>;
			dmas = <0x24 0x04 0x24 0x04>;
			dma-names = "tx", "rx";
			playback_cma = <0x80>;
			capture_cma = <0x80>;
			tx_fifo_size = <0x80>;
			rx_fifo_size = <0x80>;
			tdm_num = <0x01>;
			tx_pin = <0x00>;
			rx_pin = <0x00>;
			status = "okay";
			phandle = <0x27>;
		};

		ahub1_mach {
			compatible = "allwinner,sunxi-snd-mach";
			soundcard-mach,name = "ahubhdmi";
			soundcard-mach,format = "i2s";
			soundcard-mach,frame-master = <0x26>;
			soundcard-mach,bitclock-master = <0x26>;
			soundcard-mach,slot-num = <0x02>;
			soundcard-mach,slot-width = <0x20>;
			status = "okay";
			phandle = <0x6e>;

			soundcard-mach,cpu {
				sound-dai = <0x27>;
				soundcard-mach,pll-fs = <0x04>;
				soundcard-mach,mclk-fs = <0x00>;
				phandle = <0x26>;
			};

			soundcard-mach,codec {
				sound-dai = <0x28>;
				phandle = <0x6f>;
			};
		};

		serial@5000000 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5000000 0x400>;
			interrupts = <0x00 0x00 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x42>;
			resets = <0x02 0x11>;
			status = "okay";
			pinctrl-names = "default";
			pinctrl-0 = <0x29>;
			phandle = <0x70>;
		};

		serial@5000400 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5000400 0x400>;
			interrupts = <0x00 0x01 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x43>;
			resets = <0x02 0x12>;
			status = "disabled";
			phandle = <0x71>;
		};

		serial@5000800 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5000800 0x400>;
			interrupts = <0x00 0x02 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x44>;
			resets = <0x02 0x13>;
			status = "disabled";
			pinctrl-names = "default";
			pinctrl-0 = <0x2a>;
			phandle = <0x72>;
		};

		serial@5000c00 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5000c00 0x400>;
			interrupts = <0x00 0x03 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x45>;
			resets = <0x02 0x14>;
			status = "disabled";
			phandle = <0x73>;
		};

		serial@5001000 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5001000 0x400>;
			interrupts = <0x00 0x04 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x46>;
			resets = <0x02 0x15>;
			status = "disabled";
			phandle = <0x74>;
		};

		serial@5001400 {
			compatible = "snps,dw-apb-uart";
			reg = <0x5001400 0x400>;
			interrupts = <0x00 0x05 0x04>;
			reg-shift = <0x02>;
			reg-io-width = <0x04>;
			clocks = <0x02 0x47>;
			resets = <0x02 0x16>;
			status = "disabled";
			pinctrl-names = "default";
			pinctrl-0 = <0x2b>;
			phandle = <0x75>;
		};

		i2c@5002000 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x5002000 0x400>;
			interrupts = <0x00 0x06 0x04>;
			clocks = <0x02 0x48>;
			resets = <0x02 0x17>;
			pinctrl-names = "default";
			pinctrl-0 = <0x2c>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x76>;
		};

		i2c@5002400 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x5002400 0x400>;
			interrupts = <0x00 0x07 0x04>;
			clocks = <0x02 0x49>;
			resets = <0x02 0x18>;
			pinctrl-names = "default";
			pinctrl-0 = <0x2d>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x77>;
		};

		i2c@5002800 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x5002800 0x400>;
			interrupts = <0x00 0x08 0x04>;
			clocks = <0x02 0x4a>;
			resets = <0x02 0x19>;
			pinctrl-names = "default";
			pinctrl-0 = <0x2e>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x78>;
		};

		i2c@5002c00 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x5002c00 0x400>;
			interrupts = <0x00 0x09 0x04>;
			clocks = <0x02 0x4b>;
			resets = <0x02 0x1a>;
			pinctrl-names = "default";
			pinctrl-0 = <0x2f>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x79>;
		};

		i2c@5003000 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x5003000 0x400>;
			interrupts = <0x00 0x0a 0x04>;
			clocks = <0x02 0x4c>;
			resets = <0x02 0x1b>;
			pinctrl-names = "default";
			pinctrl-0 = <0x30>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x7a>;
		};

		spi@5010000 {
			compatible = "allwinner,sun50i-h616-spi", "allwinner,sun8i-h3-spi";
			reg = <0x5010000 0x1000>;
			interrupts = <0x00 0x0c 0x04>;
			clocks = <0x02 0x4f 0x02 0x4d>;
			clock-names = "ahb", "mod";
			resets = <0x02 0x1c>;
			pinctrl-names = "default";
			pinctrl-0 = <0x31 0x32>;
			dmas = <0x24 0x16 0x24 0x16>;
			dma-names = "rx", "tx";
			status = "okay";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x7b>;

			spidev@0 {
				status = "disabled";
				compatible = "rohm,dh2228fv";
				reg = <0x00>;
				spi-max-frequency = <0xf4240>;
			};

			flash@0 {
				status = "okay";
				#address-cells = <0x01>;
				#size-cells = <0x01>;
				compatible = "jedec,spi-nor";
				reg = <0x00>;
				spi-max-frequency = <0x2625a00>;
			};
		};

		spi@5011000 {
			compatible = "allwinner,sun50i-h616-spi", "allwinner,sun8i-h3-spi";
			reg = <0x5011000 0x1000>;
			interrupts = <0x00 0x0d 0x04>;
			clocks = <0x02 0x50 0x02 0x4e>;
			clock-names = "ahb", "mod";
			resets = <0x02 0x1d>;
			pinctrl-names = "default";
			pinctrl-0 = <0x33 0x34>;
			dmas = <0x24 0x17 0x24 0x17>;
			dma-names = "rx", "tx";
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x7c>;

			spidev@1 {
				compatible = "rohm,dh2228fv";
				status = "disabled";
				reg = <0x01>;
				spi-max-frequency = <0xf4240>;
			};
		};

		ethernet@5020000 {
			compatible = "allwinner,sun50i-h616-emac0", "allwinner,sun50i-a64-emac";
			reg = <0x5020000 0x10000>;
			interrupts = <0x00 0x0e 0x04>;
			interrupt-names = "macirq";
			clocks = <0x02 0x52>;
			clock-names = "stmmaceth";
			resets = <0x02 0x1e>;
			reset-names = "stmmaceth";
			syscon = <0x35>;
			status = "okay";
			pinctrl-names = "default";
			pinctrl-0 = <0x36>;
			phy-mode = "rgmii";
			phy-handle = <0x37>;
			allwinner,rx-delay-ps = <0x708>;
			allwinner,tx-delay-ps = <0x2bc>;
			phandle = <0x7d>;

			mdio {
				compatible = "snps,dwmac-mdio";
				#address-cells = <0x01>;
				#size-cells = <0x00>;
				phandle = <0x7e>;

				ethernet-phy@1 {
					compatible = "ethernet-phy-ieee802.3-c22";
					reg = <0x01>;
					motorcomm,clk-out-frequency-hz = <0x7735940>;
					motorcomm,keep-pll-enabled;
					motorcomm,auto-sleep-disabled;
					phandle = <0x37>;
				};
			};
		};

		ethernet@5030000 {
			compatible = "allwinner,sunxi-gmac";
			reg = <0x5030000 0x10000 0x3000034 0x04>;
			reg-names = "gmac1_reg", "ephy_reg";
			interrupts = <0x00 0x0f 0x04>;
			interrupt-names = "gmacirq";
			resets = <0x02 0x1f>;
			reset-names = "stmmaceth";
			clocks = <0x02 0x53 0x02 0x51>;
			clock-names = "bus-emac1", "emac-25m";
			pinctrl-0 = <0x38>;
			pinctrl-names = "default";
			phy-mode = "rmii";
			tx-delay = <0x07>;
			rx-delay = <0x1f>;
			phy-rst;
			gmac-power0;
			gmac-power1;
			gmac-power2;
			status = "disabled";
			phandle = <0x7f>;

			mdio {
				compatible = "ethernet-phy-ieee802.3-c22";
				#address-cells = <0x01>;
				#size-cells = <0x00>;
				phandle = <0x80>;
			};
		};

		usb@5100000 {
			compatible = "allwinner,sun50i-h616-musb", "allwinner,sun8i-h3-musb";
			reg = <0x5100000 0x400>;
			clocks = <0x02 0x70>;
			resets = <0x02 0x32>;
			interrupts = <0x00 0x19 0x04>;
			interrupt-names = "mc";
			phys = <0x39 0x00>;
			phy-names = "usb";
			extcon = <0x39 0x00>;
			status = "okay";
			dr_mode = "peripheral";
			phandle = <0x81>;
		};

		phy@5100400 {
			compatible = "allwinner,sun50i-h616-usb-phy";
			reg = <0x5100400 0x24 0x5101800 0x14 0x5200800 0x14 0x5310800 0x14 0x5311800 0x14>;
			reg-names = "phy_ctrl", "pmu0", "pmu1", "pmu2", "pmu3";
			clocks = <0x02 0x61 0x02 0x63 0x02 0x65 0x02 0x67 0x02 0x6e>;
			clock-names = "usb0_phy", "usb1_phy", "usb2_phy", "usb3_phy", "pmu2_clk";
			resets = <0x02 0x26 0x02 0x27 0x02 0x28 0x02 0x29>;
			reset-names = "usb0_reset", "usb1_reset", "usb2_reset", "usb3_reset";
			status = "okay";
			#phy-cells = <0x01>;
			usb1_vbus-supply = <0x3a>;
			phandle = <0x39>;
		};

		usb@5101000 {
			compatible = "allwinner,sun50i-h616-ehci", "generic-ehci";
			reg = <0x5101000 0x100>;
			interrupts = <0x00 0x1a 0x04>;
			clocks = <0x02 0x68 0x02 0x6c 0x02 0x60 0x02 0x65>;
			resets = <0x02 0x2a 0x02 0x2e 0x02 0x28>;
			phys = <0x39 0x00>;
			phy-names = "usb";
			status = "disabled";
			phandle = <0x82>;
		};

		usb@5101400 {
			compatible = "allwinner,sun50i-h616-ohci", "generic-ohci";
			reg = <0x5101400 0x100>;
			interrupts = <0x00 0x1b 0x04>;
			clocks = <0x02 0x68 0x02 0x60 0x02 0x65>;
			resets = <0x02 0x2a 0x02 0x28>;
			phys = <0x39 0x00>;
			phy-names = "usb";
			status = "disabled";
			phandle = <0x83>;
		};

		usb@5200000 {
			compatible = "allwinner,sun50i-h616-ehci", "generic-ehci";
			reg = <0x5200000 0x100>;
			interrupts = <0x00 0x1c 0x04>;
			clocks = <0x02 0x69 0x02 0x6d 0x02 0x62 0x02 0x65>;
			resets = <0x02 0x2b 0x02 0x2f 0x02 0x28>;
			phys = <0x39 0x01>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x84>;
		};

		usb@5200400 {
			compatible = "allwinner,sun50i-h616-ohci", "generic-ohci";
			reg = <0x5200400 0x100>;
			interrupts = <0x00 0x1d 0x04>;
			clocks = <0x02 0x69 0x02 0x62 0x02 0x65>;
			resets = <0x02 0x2b 0x02 0x28>;
			phys = <0x39 0x01>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x85>;
		};

		usb@5310000 {
			compatible = "allwinner,sun50i-h616-ehci", "generic-ehci";
			reg = <0x5310000 0x100>;
			interrupts = <0x00 0x1e 0x04>;
			clocks = <0x02 0x6a 0x02 0x6e 0x02 0x64>;
			resets = <0x02 0x2c 0x02 0x30>;
			phys = <0x39 0x02>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x86>;
		};

		usb@5310400 {
			compatible = "allwinner,sun50i-h616-ohci", "generic-ohci";
			reg = <0x5310400 0x100>;
			interrupts = <0x00 0x1f 0x04>;
			clocks = <0x02 0x6a 0x02 0x64>;
			resets = <0x02 0x2c>;
			phys = <0x39 0x02>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x87>;
		};

		usb@5311000 {
			compatible = "allwinner,sun50i-h616-ehci", "generic-ehci";
			reg = <0x5311000 0x100>;
			interrupts = <0x00 0x20 0x04>;
			clocks = <0x02 0x6b 0x02 0x6f 0x02 0x66 0x02 0x65>;
			resets = <0x02 0x2d 0x02 0x31 0x02 0x28>;
			phys = <0x39 0x03>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x88>;
		};

		usb@5311400 {
			compatible = "allwinner,sun50i-h616-ohci", "generic-ohci";
			reg = <0x5311400 0x100>;
			interrupts = <0x00 0x21 0x04>;
			clocks = <0x02 0x6b 0x02 0x66 0x02 0x65>;
			resets = <0x02 0x2d 0x02 0x28>;
			phys = <0x39 0x03>;
			phy-names = "usb";
			status = "okay";
			phandle = <0x89>;
		};

		hdmi@6000000 {
			#sound-dai-cells = <0x00>;
			compatible = "allwinner,sun50i-h616-dw-hdmi", "allwinner,sun50i-h6-dw-hdmi";
			reg = <0x6000000 0x10000>;
			reg-io-width = <0x01>;
			interrupts = <0x00 0x3f 0x04>;
			clocks = <0x02 0x75 0x02 0x73 0x02 0x72 0x02 0x74 0x02 0x7e 0x02 0x7f>;
			clock-names = "iahb", "isfr", "tmds", "cec", "hdcp", "hdcp-bus";
			resets = <0x02 0x33 0x02 0x3a>;
			reset-names = "ctrl", "hdcp";
			phys = <0x3b>;
			phy-names = "phy";
			status = "okay";
			phandle = <0x28>;

			ports {
				#address-cells = <0x01>;
				#size-cells = <0x00>;

				port@0 {
					reg = <0x00>;
					phandle = <0x8a>;

					endpoint {
						remote-endpoint = <0x3c>;
						phandle = <0x41>;
					};
				};

				port@1 {
					reg = <0x01>;
					phandle = <0x8b>;

					endpoint {
						remote-endpoint = <0x3d>;
						phandle = <0x4e>;
					};
				};
			};
		};

		hdmi-phy@6010000 {
			compatible = "allwinner,sun50i-h616-hdmi-phy";
			reg = <0x6010000 0x10000>;
			clocks = <0x02 0x75 0x02 0x73>;
			clock-names = "bus", "mod";
			resets = <0x02 0x34>;
			reset-names = "phy";
			#phy-cells = <0x00>;
			phandle = <0x3b>;
		};

		tcon-top@6510000 {
			compatible = "allwinner,sun50i-h6-tcon-top";
			reg = <0x6510000 0x1000>;
			clocks = <0x02 0x76 0x02 0x77>;
			clock-names = "bus", "tcon-tv0";
			clock-output-names = "tcon-top-tv0";
			resets = <0x02 0x35>;
			#clock-cells = <0x01>;
			phandle = <0x42>;

			ports {
				#address-cells = <0x01>;
				#size-cells = <0x00>;

				port@0 {
					#address-cells = <0x01>;
					#size-cells = <0x00>;
					reg = <0x00>;
					phandle = <0x8c>;

					endpoint@0 {
						reg = <0x00>;
						remote-endpoint = <0x3e>;
						phandle = <0x0c>;
					};
				};

				port@1 {
					#address-cells = <0x01>;
					#size-cells = <0x00>;
					reg = <0x01>;
					phandle = <0x8d>;

					endpoint@2 {
						reg = <0x02>;
						remote-endpoint = <0x3f>;
						phandle = <0x43>;
					};
				};

				port@4 {
					#address-cells = <0x01>;
					#size-cells = <0x00>;
					reg = <0x04>;
					phandle = <0x8e>;

					endpoint@0 {
						reg = <0x00>;
						remote-endpoint = <0x40>;
						phandle = <0x44>;
					};
				};

				port@5 {
					reg = <0x05>;
					phandle = <0x8f>;

					endpoint {
						remote-endpoint = <0x41>;
						phandle = <0x3c>;
					};
				};
			};
		};

		lcd-controller@6515000 {
			compatible = "allwinner,sun50i-h6-tcon-tv", "allwinner,sun8i-r40-tcon-tv";
			reg = <0x6515000 0x1000>;
			interrupts = <0x00 0x42 0x04>;
			clocks = <0x02 0x79 0x42 0x00>;
			clock-names = "ahb", "tcon-ch1";
			resets = <0x02 0x36>;
			reset-names = "lcd";
			phandle = <0x90>;

			ports {
				#address-cells = <0x01>;
				#size-cells = <0x00>;

				port@0 {
					reg = <0x00>;
					phandle = <0x91>;

					endpoint {
						remote-endpoint = <0x43>;
						phandle = <0x3f>;
					};
				};

				port@1 {
					#address-cells = <0x01>;
					#size-cells = <0x00>;
					reg = <0x01>;
					phandle = <0x92>;

					endpoint@1 {
						reg = <0x01>;
						remote-endpoint = <0x44>;
						phandle = <0x40>;
					};
				};
			};
		};

		rtc@7000000 {
			compatible = "allwinner,sun50i-h616-rtc";
			reg = <0x7000000 0x400>;
			interrupts = <0x00 0x68 0x04>;
			clocks = <0x45 0x0e 0x0f 0x02 0x80>;
			clock-names = "bus", "hosc", "pll-32k";
			#clock-cells = <0x01>;
			phandle = <0x10>;
		};

		clock@7010000 {
			compatible = "allwinner,sun50i-h616-r-ccu";
			reg = <0x7010000 0x210>;
			clocks = <0x0f 0x10 0x00 0x10 0x02 0x02 0x04>;
			clock-names = "hosc", "losc", "iosc", "pll-periph";
			#clock-cells = <0x01>;
			#reset-cells = <0x01>;
			phandle = <0x45>;
		};

		pinctrl@7022000 {
			compatible = "allwinner,sun50i-h616-r-pinctrl";
			reg = <0x7022000 0x400>;
			interrupts = <0x00 0x2b 0x04>;
			clocks = <0x45 0x02 0x0f 0x10 0x00>;
			clock-names = "apb", "hosc", "losc";
			gpio-controller;
			#gpio-cells = <0x03>;
			interrupt-controller;
			#interrupt-cells = <0x03>;
			phandle = <0x93>;

			r-i2c-pins {
				pins = "PL0", "PL1";
				function = "s_i2c";
				phandle = <0x94>;
			};

			r-rsb-pins {
				pins = "PL0", "PL1";
				function = "s_rsb";
				phandle = <0x47>;
			};
		};

		ir@7040000 {
			compatible = "allwinner,sun50i-h616-ir", "allwinner,sun6i-a31-ir";
			reg = <0x7040000 0x400>;
			interrupts = <0x00 0x6a 0x04>;
			clocks = <0x45 0x09 0x45 0x0b>;
			clock-names = "apb", "ir";
			resets = <0x45 0x05>;
			pinctrl-names = "default";
			pinctrl-0 = <0x46>;
			status = "okay";
			phandle = <0x95>;
		};

		i2c@7081400 {
			compatible = "allwinner,sun50i-h616-i2c", "allwinner,sun8i-v536-i2c", "allwinner,sun6i-a31-i2c";
			reg = <0x7081400 0x400>;
			interrupts = <0x00 0x69 0x04>;
			clocks = <0x45 0x08>;
			resets = <0x45 0x04>;
			status = "okay";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x96>;

			pmic@36 {
				compatible = "x-powers,axp313a";
				reg = <0x36>;
				wakeup-source;
				phandle = <0x97>;

				regulators {

					dcdc1 {
						regulator-name = "axp313a-dcdc1";
						regulator-min-microvolt = <0x7a120>;
						regulator-max-microvolt = <0x10c8e0>;
						regulator-step-delay-us = <0x19>;
						regulator-final-delay-us = <0x32>;
						regulator-always-on;
						phandle = <0x0d>;
					};

					dcdc2 {
						regulator-name = "axp313a-dcdc2";
						regulator-min-microvolt = <0x7a120>;
						regulator-max-microvolt = <0x124f80>;
						regulator-step-delay-us = <0x19>;
						regulator-final-delay-us = <0x32>;
						regulator-ramp-delay = <0xc8>;
						regulator-always-on;
						phandle = <0x04>;
					};

					dcdc3 {
						regulator-name = "axp313a-dcdc3";
						regulator-min-microvolt = <0x10c8e0>;
						regulator-max-microvolt = <0x10c8e0>;
						regulator-step-delay-us = <0x19>;
						regulator-final-delay-us = <0x32>;
						regulator-always-on;
						phandle = <0x98>;
					};

					ldo1 {
						regulator-name = "axp313a-aldo1";
						regulator-min-microvolt = <0x1b7740>;
						regulator-max-microvolt = <0x1b7740>;
						regulator-step-delay-us = <0x19>;
						regulator-final-delay-us = <0x32>;
						regulator-always-on;
						phandle = <0x99>;
					};

					ldo2 {
						regulator-name = "axp313a-dldo1";
						regulator-min-microvolt = <0x325aa0>;
						regulator-max-microvolt = <0x325aa0>;
						regulator-step-delay-us = <0x19>;
						regulator-final-delay-us = <0x32>;
						regulator-always-on;
						phandle = <0x1d>;
					};
				};
			};
		};

		rsb@7083000 {
			compatible = "allwinner,sun50i-h616-rsb", "allwinner,sun8i-a23-rsb";
			reg = <0x7083000 0x400>;
			interrupts = <0x00 0x6d 0x04>;
			clocks = <0x45 0x0d>;
			clock-frequency = <0x2dc6c0>;
			resets = <0x45 0x07>;
			pinctrl-names = "default";
			pinctrl-0 = <0x47>;
			status = "disabled";
			#address-cells = <0x01>;
			#size-cells = <0x00>;
			phandle = <0x9a>;
		};

		thermal-sensor@5070400 {
			compatible = "allwinner,sun50i-h616-ths";
			reg = <0x5070400 0x400>;
			interrupts = <0x00 0x13 0x04>;
			clocks = <0x02 0x56>;
			clock-names = "bus";
			resets = <0x02 0x21>;
			nvmem-cells = <0x48>;
			nvmem-cell-names = "calibration";
			#thermal-sensor-cells = <0x01>;
			phandle = <0x49>;
		};

		dump_reg@20000 {
			compatible = "allwinner,sunxi-dump-reg";
			reg = <0x00 0x3001000 0x00 0xf20>;
			status = "okay";
			phandle = <0x9b>;
		};

		sunxi-info {
			compatible = "allwinner,sun50i-h616-sys-info";
			status = "okay";
		};

		addr-mgt {
			compatible = "allwinner,sunxi-addr_mgt";
			type_addr_wifi = <0x02>;
			type_addr_bt = <0x02>;
			type_addr_eth = <0x02>;
			status = "okay";
			phandle = <0x9c>;
		};

		lradc@5070800 {
			compatible = "allwinner,sun50i-h616-lradc";
			reg = <0x5070800 0x400>;
			interrupts = <0x00 0x14 0x01>;
			clocks = <0x02 0x71>;
			resets = <0x02 0x3b>;
			status = "disabled";
			phandle = <0x9d>;
		};
	};

	thermal-zones {

		cpu-thermal {
			polling-delay-passive = <0x00>;
			polling-delay = <0x00>;
			thermal-sensors = <0x49 0x02>;

			trips {

				cpu-alert {
					temperature = <0x14c08>;
					hysteresis = <0x7d0>;
					type = "passive";
					phandle = <0x4a>;
				};

				cpu-crit {
					temperature = <0x186a0>;
					hysteresis = <0x00>;
					type = "critical";
				};
			};

			cooling-maps {

				map0 {
					trip = <0x4a>;
					cooling-device = <0x06 0xffffffff 0xffffffff 0x07 0xffffffff 0xffffffff 0x08 0xffffffff 0xffffffff 0x09 0xffffffff 0xffffffff>;
				};
			};
		};

		gpu-thermal {
			polling-delay-passive = <0x00>;
			polling-delay = <0x00>;
			thermal-sensors = <0x49 0x00>;

			trips {

				gpu-alert {
					temperature = <0x14c08>;
					hysteresis = <0x7d0>;
					type = "passive";
					phandle = <0x4b>;
				};

				gpu-crit {
					temperature = <0x186a0>;
					hysteresis = <0x00>;
					type = "critical";
				};
			};

			cooling-maps {

				map0 {
					trip = <0x4b>;
					cooling-device = <0x4c 0xffffffff 0xffffffff>;
				};
			};
		};

		ve-thermal {
			polling-delay-passive = <0x00>;
			polling-delay = <0x00>;
			thermal-sensors = <0x49 0x01>;

			trips {

				ve-alert {
					temperature = <0x14c08>;
					hysteresis = <0x7d0>;
					type = "passive";
					phandle = <0x9e>;
				};
			};
		};

		ddr-thermal {
			polling-delay-passive = <0x00>;
			polling-delay = <0x00>;
			thermal-sensors = <0x49 0x03>;

			trips {

				ddr-alert {
					temperature = <0x14c08>;
					hysteresis = <0x7d0>;
					type = "passive";
					phandle = <0x9f>;
				};
			};
		};
	};

	gpu-opp-table {
		compatible = "operating-points-v2";
		phandle = <0xa0>;

		opp-125000000 {
			opp-hz = <0x00 0x7735940>;
			opp-microvolt = <0xc5c10>;
		};

		opp-250000000 {
			opp-hz = <0x00 0xee6b280>;
			opp-microvolt = <0xc5c10>;
		};

		opp-432000000 {
			opp-hz = <0x00 0x19bfcc00>;
			opp-microvolt = <0xc5c10>;
		};

		opp-600000000 {
			opp-hz = <0x00 0x23c34600>;
			opp-microvolt = <0xea600>;
		};

		opp-800000000 {
			opp-hz = <0x00 0x2faf0800>;
			opp-microvolt = <0x107ac0>;
		};
	};

	opp-table-cpu {
		compatible = "allwinner,sun50i-h616-operating-points";
		nvmem-cells = <0x4d>;
		opp-shared;
		phandle = <0x03>;

		opp-480000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x1c9c3800>;
			opp-microvolt-speed0 = <0xdbba0 0xdbba0 0x10c8e0>;
			opp-microvolt-speed1 = <0xdbba0 0xdbba0 0x10c8e0>;
			opp-microvolt-speed2 = <0xdbba0 0xdbba0 0x10c8e0>;
		};

		opp-600000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x23c34600>;
			opp-microvolt-speed0 = <0xdbba0 0xdbba0 0x10c8e0>;
			opp-microvolt-speed1 = <0xe09c0 0xe09c0 0x10c8e0>;
			opp-microvolt-speed2 = <0xe09c0 0xe09c0 0x10c8e0>;
		};

		opp-792000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x2f34f600>;
			opp-microvolt-speed0 = <0xdbba0 0xdbba0 0x10c8e0>;
			opp-microvolt-speed1 = <0xe57e0 0xe57e0 0x10c8e0>;
			opp-microvolt-speed2 = <0xe57e0 0xe57e0 0x10c8e0>;
		};

		opp-1008000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x3c14dc00>;
			opp-microvolt-speed0 = <0xdbba0 0xdbba0 0x10c8e0>;
			opp-microvolt-speed1 = <0xf9060 0xf9060 0x10c8e0>;
			opp-microvolt-speed2 = <0xf9060 0xf9060 0x10c8e0>;
		};

		opp-1200000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x47868c00>;
			opp-microvolt-speed0 = <0xea600 0xea600 0x10c8e0>;
			opp-microvolt-speed1 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed2 = <0x10c8e0 0x10c8e0 0x10c8e0>;
		};

		opp-1344000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x501bd000>;
			opp-microvolt-speed0 = <0x100590 0x100590 0x10c8e0>;
			opp-microvolt-speed1 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed2 = <0x10c8e0 0x10c8e0 0x10c8e0>;
		};

		opp-1416000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x54667200>;
			opp-microvolt-speed0 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed1 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed2 = <0x10c8e0 0x10c8e0 0x10c8e0>;
		};

		opp-1512000000 {
			clock-latency-ns = <0x3b9b0>;
			opp-hz = <0x00 0x5a1f4a00>;
			opp-microvolt-speed0 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed1 = <0x10c8e0 0x10c8e0 0x10c8e0>;
			opp-microvolt-speed2 = <0x10c8e0 0x10c8e0 0x10c8e0>;
		};
	};

	aliases {
		ethernet0 = "/soc/ethernet@5020000";
		serial0 = "/soc/serial@5000000";
		serial5 = "/soc/serial@5001400";
	};

	chosen {
		stdout-path = "serial0:115200n8";
	};

	connector {
		compatible = "hdmi-connector";
		type = "d";

		port {

			endpoint {
				remote-endpoint = <0x4e>;
				phandle = <0x3d>;
			};
		};
	};

	leds {
		compatible = "gpio-leds";
		phandle = <0xa1>;

		led-red {
			label = "red_led";
			gpios = <0x1e 0x02 0x0c 0x00>;
			linux,default-trigger = "none";
		};

		led-green {
			label = "green_led";
			gpios = <0x1e 0x02 0x0d 0x00>;
			linux,default-trigger = "heartbeat";
		};
	};

	vcc5v {
		compatible = "regulator-fixed";
		regulator-name = "vcc-5v";
		regulator-min-microvolt = <0x4c4b40>;
		regulator-max-microvolt = <0x4c4b40>;
		regulator-always-on;
		phandle = <0x4f>;
	};

	usb1-vbus {
		compatible = "regulator-fixed";
		regulator-name = "usb1-vbus";
		regulator-min-microvolt = <0x4c4b40>;
		regulator-max-microvolt = <0x4c4b40>;
		vin-supply = <0x4f>;
		enable-active-high;
		gpio = <0x1e 0x02 0x10 0x00>;
		status = "okay";
		phandle = <0x3a>;
	};

	vcc33-wifi {
		compatible = "regulator-fixed";
		regulator-name = "vcc33-wifi";
		regulator-min-microvolt = <0x325aa0>;
		regulator-max-microvolt = <0x325aa0>;
		regulator-always-on;
		vin-supply = <0x4f>;
		phandle = <0x20>;
	};

	vcc-wifi-io {
		compatible = "regulator-fixed";
		regulator-name = "vcc-wifi-io";
		regulator-min-microvolt = <0x1b7740>;
		regulator-max-microvolt = <0x1b7740>;
		regulator-always-on;
		vin-supply = <0x20>;
		phandle = <0x21>;
	};

	wifi-pwrseq {
		compatible = "mmc-pwrseq-simple";
		clocks = <0x10 0x01>;
		clock-names = "osc32k-out";
		reset-gpios = <0x1e 0x06 0x12 0x01>;
		post-power-on-delay-ms = <0xc8>;
		phandle = <0x22>;
	};

	__symbols__ {
		cpu0 = "/cpus/cpu@0";
		cpu1 = "/cpus/cpu@1";
		cpu2 = "/cpus/cpu@2";
		cpu3 = "/cpus/cpu@3";
		de = "/display-engine";
		osc24M = "/osc24M-clk";
		display_clocks = "/soc/bus@1000000/clock@8000";
		mixer0 = "/soc/bus@1000000/mixer@100000";
		mixer0_out = "/soc/bus@1000000/mixer@100000/ports/port@1";
		mixer0_out_tcon_top_mixer0 = "/soc/bus@1000000/mixer@100000/ports/port@1/endpoint";
		gpu = "/soc/gpu@1800000";
		syscon = "/soc/syscon@3000000";
		sram_a2 = "/soc/syscon@3000000/sram@100000";
		scpi_sram = "/soc/syscon@3000000/sram@100000/scpi-sram@17c00";
		sram_c = "/soc/syscon@3000000/sram@28000";
		de3_sram = "/soc/syscon@3000000/sram@28000/sram-section@0";
		sram_c1 = "/soc/syscon@3000000/sram@1a00000";
		ve_sram = "/soc/syscon@3000000/sram@1a00000/sram-section@0";
		ccu = "/soc/clock@3001000";
		sid = "/soc/efuse@3006000";
		cpu_speed_grade = "/soc/efuse@3006000/cpu-speed-grade@00";
		ths_calibration = "/soc/efuse@3006000/thermal-sensor-calibration@14";
		ephy_calibration = "/soc/efuse@3006000/ephy-calibration@2c";
		watchdog = "/soc/watchdog@30090a0";
		pwm = "/soc/pwm@300a000";
		pwm0 = "/soc/pwm0@0300a000";
		pwm1 = "/soc/pwm1@0300a000";
		pwm2 = "/soc/pwm2@0300a000";
		pwm3 = "/soc/pwm3@0300a000";
		pwm4 = "/soc/pwm4@0300a000";
		pwm5 = "/soc/pwm5@0300a000";
		pio = "/soc/pinctrl@300b000";
		ext_rgmii_pins = "/soc/pinctrl@300b000/rgmii-pins";
		i2c0_pi_pins = "/soc/pinctrl@300b000/i2c0-pi-pins";
		i2c1_ph_pins = "/soc/pinctrl@300b000/i2c1-ph-pins";
		i2c1_pi_pins = "/soc/pinctrl@300b000/i2c1-pi-pins";
		i2c2_ph_pins = "/soc/pinctrl@300b000/i2c2-ph-pins";
		i2c2_pi_pins = "/soc/pinctrl@300b000/i2c2-pi-pins";
		i2c3_ph_pins = "/soc/pinctrl@300b000/i2c3-ph-pins";
		i2c3_pa_pins = "/soc/pinctrl@300b000/i2c3-pa-pins";
		i2c4_ph_pins = "/soc/pinctrl@300b000/i2c4-ph-pins";
		i2s3_pins = "/soc/pinctrl@300b000/i2s3-pins";
		ir_rx_pin = "/soc/pinctrl@300b000/ir-rx-pin";
		pwm1_ph_pin = "/soc/pinctrl@300b000/pwm1-ph-pin";
		pwm2_ph_pin = "/soc/pinctrl@300b000/pwm2-ph-pin";
		pwm3_ph_pin = "/soc/pinctrl@300b000/pwm3-ph-pin";
		pwm4_ph_pin = "/soc/pinctrl@300b000/pwm4-ph-pin";
		pwm5_pin = "/soc/pinctrl@300b000/pwm5-pin";
		pwm1_pi_pin = "/soc/pinctrl@300b000/pwm1-pi-pin";
		pwm2_pi_pin = "/soc/pinctrl@300b000/pwm2-pi-pin";
		pwm3_pi_pin = "/soc/pinctrl@300b000/pwm3-pi-pin";
		pwm4_pi_pin = "/soc/pinctrl@300b000/pwm4-pi-pin";
		mmc0_pins = "/soc/pinctrl@300b000/mmc0-pins";
		mmc1_pins = "/soc/pinctrl@300b000/mmc1-pins";
		mmc2_pins = "/soc/pinctrl@300b000/mmc2-pins";
		rmii_pins = "/soc/pinctrl@300b000/rmii-pins";
		spi0_pins = "/soc/pinctrl@300b000/spi0-pins";
		spi0_cs0_pin = "/soc/pinctrl@300b000/spi0-cs0-pin";
		spi1_pins = "/soc/pinctrl@300b000/spi1-pins";
		spi1_cs0_pin = "/soc/pinctrl@300b000/spi1-cs0-pin";
		spi1_cs1_pin = "/soc/pinctrl@300b000/spi1-cs1-pin";
		uart0_ph_pins = "/soc/pinctrl@300b000/uart0-ph-pins";
		uart1_ph_pins = "/soc/pinctrl@300b000/uart1-ph-pins";
		uart1_ph_rts_cts_pins = "/soc/pinctrl@300b000/uart1-ph-rts-cts-pins";
		uart2_ph_pins = "/soc/pinctrl@300b000/uart2-ph-pins";
		uart2_ph_rts_cts_pins = "/soc/pinctrl@300b000/uart2-ph-rts-cts-pins";
		uart2_pi_pins = "/soc/pinctrl@300b000/uart2-pi-pins";
		uart3_pi_pins = "/soc/pinctrl@300b000/uart3-pi-pins";
		uart4_pi_pins = "/soc/pinctrl@300b000/uart4-pi-pins";
		uart5_ph_pins = "/soc/pinctrl@300b000/uart5-ph-pins";
		gic = "/soc/interrupt-controller@3021000";
		mmc0 = "/soc/mmc@4020000";
		mmc1 = "/soc/mmc@4021000";
		mmc2 = "/soc/mmc@4022000";
		dma = "/soc/dma-controller@3002000";
		codec = "/soc/codec@05096000";
		ahub_dam_plat = "/soc/ahub_dam_plat@5097000";
		ahub_dam_mach = "/soc/ahub_dam_mach";
		ahub1_plat = "/soc/ahub1_plat";
		ahub1_mach = "/soc/ahub1_mach";
		ahub1_cpu = "/soc/ahub1_mach/soundcard-mach,cpu";
		ahub1_codec = "/soc/ahub1_mach/soundcard-mach,codec";
		uart0 = "/soc/serial@5000000";
		uart1 = "/soc/serial@5000400";
		uart2 = "/soc/serial@5000800";
		uart3 = "/soc/serial@5000c00";
		uart4 = "/soc/serial@5001000";
		uart5 = "/soc/serial@5001400";
		i2c0 = "/soc/i2c@5002000";
		i2c1 = "/soc/i2c@5002400";
		i2c2 = "/soc/i2c@5002800";
		i2c3 = "/soc/i2c@5002c00";
		i2c4 = "/soc/i2c@5003000";
		spi0 = "/soc/spi@5010000";
		spi1 = "/soc/spi@5011000";
		emac0 = "/soc/ethernet@5020000";
		mdio0 = "/soc/ethernet@5020000/mdio";
		ext_rgmii_phy = "/soc/ethernet@5020000/mdio/ethernet-phy@1";
		emac1 = "/soc/ethernet@5030000";
		mdio1 = "/soc/ethernet@5030000/mdio";
		usbotg = "/soc/usb@5100000";
		usbphy = "/soc/phy@5100400";
		ehci0 = "/soc/usb@5101000";
		ohci0 = "/soc/usb@5101400";
		ehci1 = "/soc/usb@5200000";
		ohci1 = "/soc/usb@5200400";
		ehci2 = "/soc/usb@5310000";
		ohci2 = "/soc/usb@5310400";
		ehci3 = "/soc/usb@5311000";
		ohci3 = "/soc/usb@5311400";
		hdmi = "/soc/hdmi@6000000";
		hdmi_in = "/soc/hdmi@6000000/ports/port@0";
		hdmi_in_tcon_top = "/soc/hdmi@6000000/ports/port@0/endpoint";
		hdmi_out = "/soc/hdmi@6000000/ports/port@1";
		hdmi_out_con = "/soc/hdmi@6000000/ports/port@1/endpoint";
		hdmi_phy = "/soc/hdmi-phy@6010000";
		tcon_top = "/soc/tcon-top@6510000";
		tcon_top_mixer0_in = "/soc/tcon-top@6510000/ports/port@0";
		tcon_top_mixer0_in_mixer0 = "/soc/tcon-top@6510000/ports/port@0/endpoint@0";
		tcon_top_mixer0_out = "/soc/tcon-top@6510000/ports/port@1";
		tcon_top_mixer0_out_tcon_tv = "/soc/tcon-top@6510000/ports/port@1/endpoint@2";
		tcon_top_hdmi_in = "/soc/tcon-top@6510000/ports/port@4";
		tcon_top_hdmi_in_tcon_tv = "/soc/tcon-top@6510000/ports/port@4/endpoint@0";
		tcon_top_hdmi_out = "/soc/tcon-top@6510000/ports/port@5";
		tcon_top_hdmi_out_hdmi = "/soc/tcon-top@6510000/ports/port@5/endpoint";
		tcon_tv = "/soc/lcd-controller@6515000";
		tcon_tv_in = "/soc/lcd-controller@6515000/ports/port@0";
		tcon_tv_in_tcon_top_mixer0 = "/soc/lcd-controller@6515000/ports/port@0/endpoint";
		tcon_tv_out = "/soc/lcd-controller@6515000/ports/port@1";
		tcon_tv_out_tcon_top = "/soc/lcd-controller@6515000/ports/port@1/endpoint@1";
		rtc = "/soc/rtc@7000000";
		r_ccu = "/soc/clock@7010000";
		r_pio = "/soc/pinctrl@7022000";
		r_i2c_pins = "/soc/pinctrl@7022000/r-i2c-pins";
		r_rsb_pins = "/soc/pinctrl@7022000/r-rsb-pins";
		ir = "/soc/ir@7040000";
		r_i2c = "/soc/i2c@7081400";
		axp313a = "/soc/i2c@7081400/pmic@36";
		reg_dcdc1 = "/soc/i2c@7081400/pmic@36/regulators/dcdc1";
		reg_dcdc2 = "/soc/i2c@7081400/pmic@36/regulators/dcdc2";
		reg_dcdc3 = "/soc/i2c@7081400/pmic@36/regulators/dcdc3";
		reg_aldo1 = "/soc/i2c@7081400/pmic@36/regulators/ldo1";
		reg_dldo1 = "/soc/i2c@7081400/pmic@36/regulators/ldo2";
		r_rsb = "/soc/rsb@7083000";
		ths = "/soc/thermal-sensor@5070400";
		dump_reg = "/soc/dump_reg@20000";
		addr_mgt = "/soc/addr-mgt";
		r_lradc = "/soc/lradc@5070800";
		cpu_alert = "/thermal-zones/cpu-thermal/trips/cpu-alert";
		gpu_alert = "/thermal-zones/gpu-thermal/trips/gpu-alert";
		ve_alert = "/thermal-zones/ve-thermal/trips/ve-alert";
		ddr_alert = "/thermal-zones/ddr-thermal/trips/ddr-alert";
		gpu_opp_table = "/gpu-opp-table";
		cpu_opp_table = "/opp-table-cpu";
		hdmi_con_in = "/connector/port/endpoint";
		leds = "/leds";
		reg_vcc5v = "/vcc5v";
		reg_usb1_vbus = "/usb1-vbus";
		reg_vcc33_wifi = "/vcc33-wifi";
		reg_vcc_wifi_io = "/vcc-wifi-io";
		wifi_pwrseq = "/wifi-pwrseq";
	};
};
```

---

🎉 Done !

You now have a Python-powered live SPI display running on your Orange Pi Zero 3 under Kali Linux 2025.

>Tip: Expand the script to display weather, IP address, CPU temp, etc. The possibilities are endless.

### Made for real Orange Pi hackers.

### Examples:

---

# Gif.py >
## Gif's displayed on screen

>You will need to convert the gif file using the correct format needed


```python
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# usage:
# python gif.py for the orangepi zero 3 - TFT IC: ST7735S
#
import opigpio_patch  # Must be first to monkey-patch RPi.GPIO
import OPi.GPIO as GPIO
import time
from luma.core.interface.serial import spi
from luma.lcd.device import st7735
from PIL import Image, ImageDraw, ImageFont, ImageSequence

GPIO.setmode(GPIO.SUNXI)
GPIO.setwarnings(False)

serial = spi(port=1, device=1, gpio_DC="PC6", gpio_RST="PC11", gpio=GPIO)

#device = st7735(serial_interface=serial, gpio=GPIO, width=128, 
# height=160, rotate=0)

device = st7735(
    serial_interface=serial,
    gpio=GPIO,
    gpio_LIGHT="PC9",  # <- This disables backlight control 
  # *DO NOT plug in BLK to PC9*
    width=160,
    height=128,
    rotate=0
)

gif = Image.open("kali.gif")
while True:
    for frame in ImageSequence.Iterator(gif):
        frame = frame.convert("RGB").resize((device.width, device.height))
        device.display(frame)
        time.sleep(gif.info.get('duration', 100) / 1000.0)  # delay in seconds
                 
```

---

# Terminal >
## Terminal displayed on screen [ROUGH]

```python
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# usage:
# python terminal.py for the orangepi zero 3 - TFT IC: ST7735S
#
import os
import pty
import select

# Set up pty and fork BEFORE any other complex imports
master_fd, slave_fd = pty.openpty()
pid = os.fork()

if pid == 0:
    # Child: Replace process with a shell
    os.putenv("TERM", "linux")
    os.dup2(slave_fd, 0)
    os.dup2(slave_fd, 1)
    os.dup2(slave_fd, 2)
    os.execv("/bin/bash", ["/bin/bash"])

# ---- PARENT PROCESS ----
import pyte
import time
import threading
from PIL import Image, ImageDraw, ImageFont

import opigpio_patch
import OPi.GPIO as GPIO
from luma.core.interface.serial import spi
from luma.lcd.device import st7735
import sys
import termios
import tty

def read_keyboard_input():
    # Set terminal to raw mode to capture individual keypresses
    old_settings = termios.tcgetattr(sys.stdin)
    tty.setcbreak(sys.stdin.fileno())

    try:
        while True:
            key = os.read(sys.stdin.fileno(), 1)
            os.write(master_fd, key)
    finally:
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

# Setup GPIO + SPI + LCD
GPIO.setmode(GPIO.SUNXI)
GPIO.setwarnings(False)
serial = spi(port=1, device=1, gpio_DC="PC6", gpio_RST="PC11", gpio=GPIO)
device = st7735(serial_interface=serial, gpio=GPIO, gpio_LIGHT="PC9", 
                width=160, height=128, rotate=0)

# Load font
font = ImageFont.truetype("FreeMono.ttf", 11)
bbox = font.getbbox("A")
char_width = bbox[2] - bbox[0]
char_height = bbox[3] - bbox[1]

cols = device.width // char_width
rows = device.height // char_height

# Setup pyte screen
screen = pyte.Screen(cols, rows)
stream = pyte.Stream(screen)

# Thread to read shell output
def read_from_shell():
    while True:
        r, _, _ = select.select([master_fd], [], [], 0.1)
        if r:
            output = os.read(master_fd, 1024).decode(errors="ignore")
            stream.feed(output)

# Thread to draw to LCD
def draw_loop():
    while True:
        image = Image.new("RGB", (device.width, device.height), "black")
        draw = ImageDraw.Draw(image)
        for y, line in enumerate(screen.display):
            draw.text((0, y * char_height), line, font=font, fill="white")
        device.display(image)
        time.sleep(0.05)

threading.Thread(target=read_from_shell, daemon=True).start()
threading.Thread(target=read_keyboard_input, daemon=True).start()
draw_loop()

```

![PXL_20250630_224517558 cleaned](https://github.com/user-attachments/assets/8698a5dc-fa45-43a2-94a8-c8f6a783c412)

---

# Image.py >
## Image displayed on screen

```python
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# usage:
# python image.py for the orangepi zero 3 - TFT IC: ST7735S
#
import opigpio_patch  # Must be first
import OPi.GPIO as GPIO
from luma.core.interface.serial import spi
from luma.lcd.device import st7735
from PIL import Image, ImageDraw, ImageFont
import time
import os

GPIO.setmode(GPIO.SUNXI)
GPIO.setwarnings(False)

# SPI Display setup
serial = spi(port=1, device=1, gpio_DC="PC6", gpio_RST="PC11", gpio=GPIO)
device = st7735(
    serial_interface=serial,
    gpio=GPIO,
    gpio_LIGHT="PC9",  # Warning: Disables backlight control
    width=160,
    height=128,
    rotate=0
)

# Font setup (use default for compatibility)
font = ImageFont.load_default()
#line_height = font.getsize("A")[1] + 2
bbox = font.getbbox("A")
line_height = (bbox[3] - bbox[1]) + 2

max_lines = device.height // line_height

# Display logo first
from PIL import Image
logo = Image.open("logo.jpg").resize((device.width, device.height)).convert("RGB")
device.display(logo)
time.sleep(2)

# Tail log and render lines
def tail_log(path):
    with open(path, 'r') as f:
        f.seek(0, os.SEEK_END)
        lines = []
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.1)
                continue
            lines.append(line.strip())
            lines = lines[-max_lines:]

            # Create image canvas
            img = Image.new("RGB", (device.width, device.height), "black")
            draw = ImageDraw.Draw(img)

            for i, l in enumerate(lines):
                draw.text((0, i * line_height), l, font=font, fill="white")

            device.display(img)

try:
    tail_log("/tmp/term.log")
except KeyboardInterrupt:
    print("Exiting.")

```
![PXL_20250630_230511866 cleaned](https://github.com/user-attachments/assets/757f8d72-29cc-4b3d-9eb4-3b67b14bb862)
---

# Video.py >
## Video displayed on screen

```python
# ========================================== #
#    Made by aMiscreant for Miscreants       #
# ========================================== #
# usage:
# python video.py for the orangepi zero 3 - TFT IC: ST7735S
#
import cv2
import time
from PIL import Image
import opigpio_patch  # Must be first to monkey-patch RPi.GPIO
import OPi.GPIO as GPIO
from luma.core.interface.serial import spi
from luma.lcd.device import st7735

# Setup GPIO and SPI
GPIO.setmode(GPIO.SUNXI)
GPIO.setwarnings(False)
serial = spi(port=1, device=1, gpio_DC="PC6", gpio_RST="PC11", gpio=GPIO)

device = st7735(
    serial_interface=serial,
    gpio=GPIO,
    gpio_LIGHT="PC9",  # Disables backlight control
    width=160,
    height=128,
    rotate=0
)

# Open the video file
cap = cv2.VideoCapture('resized.mp4')  # Replace with your video file path

# Set video frame rate (FPS)
fps = cap.get(cv2.CAP_PROP_FPS)

# Loop through video frames
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break  # End of video

    # Resize frame to match the display resolution
    frame_resized = cv2.resize(frame, (device.width, device.height))

    # Convert frame from BGR (OpenCV format) to RGB (PIL format)
    frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)

    # Convert to PIL Image
    frame_image = Image.fromarray(frame_rgb)

    # Display the frame on the device
    device.display(frame_image)

    # Wait for the next frame based on FPS
    time.sleep(0.5 / fps)

# Release the video capture object
cap.release()
```
[Video](https://github.com/user-attachments/assets/72666177-68ea-4110-987e-2597e918689e)

---