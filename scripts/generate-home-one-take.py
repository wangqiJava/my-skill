from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "docs" / "public" / "images"
OUTPUT_ROOT = IMAGE_ROOT / "continuous-scene"
WIDTH = 1536
HEIGHT = 864
FRAME_COUNT = 36
RESAMPLE = getattr(Image, "Resampling", Image).LANCZOS


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def smoothstep(start: float, end: float, value: float) -> float:
    amount = clamp((value - start) / max(0.0001, end - start))
    return amount * amount * (3.0 - 2.0 * amount)


def resized_layer(image: Image.Image, scale: float, x: float, y: float) -> Image.Image:
    layer_width = max(1, round(WIDTH * scale))
    layer_height = max(1, round(HEIGHT * scale))
    fitted = ImageOps.fit(
        image,
        (layer_width, layer_height),
        method=RESAMPLE,
        centering=(0.5, 0.56),
    )
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    left = round((WIDTH - layer_width) / 2 + x)
    top = round((HEIGHT - layer_height) / 2 + y)
    canvas.paste(fitted, (left, top), fitted)
    return canvas


def with_alpha(image: Image.Image, amount: float) -> Image.Image:
    result = image.copy().convert("RGBA")
    alpha = result.getchannel("A").point(lambda value: round(value * amount))
    result.putalpha(alpha)
    return result


def paper_noise() -> Image.Image:
    generator = random.Random(20260925)
    values = bytes(
        max(0, min(255, round(generator.gauss(128, 17))))
        for _ in range(WIDTH * HEIGHT)
    )
    return Image.frombytes("L", (WIDTH, HEIGHT), values)


def paper_base(noise: Image.Image) -> Image.Image:
    paper = Image.new("RGB", (WIDTH, HEIGHT), (245, 240, 230))
    grain = ImageOps.colorize(noise, (236, 229, 217), (252, 248, 240))
    return Image.blend(paper, grain, 0.085).convert("RGBA")


def notes_matte(notes: Image.Image) -> Image.Image:
    rgb = notes.convert("RGB")
    gray = ImageOps.grayscale(rgb)
    paper_gray = Image.new("L", rgb.size, 244)
    difference = ImageChops.difference(gray, paper_gray)
    difference = difference.point(lambda value: round(clamp((value - 3) / 54) * 255))
    difference = difference.filter(ImageFilter.GaussianBlur(3.5))

    edge = Image.new("L", rgb.size, 0)
    edge_draw = ImageDraw.Draw(edge)
    edge_draw.ellipse((-220, -120, rgb.width + 220, rgb.height + 180), fill=255)
    edge = edge.filter(ImageFilter.GaussianBlur(46))
    matte = ImageChops.multiply(difference, edge)
    result = rgb.convert("RGBA")
    result.putalpha(matte)
    return result


def mist_layer(progress: float) -> Image.Image:
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(mask)
    drift = math.sin(progress * math.pi * 1.5) * 30
    for index, (center_y, width, height, opacity) in enumerate(
        (
            (HEIGHT * 0.55, WIDTH * 0.66, HEIGHT * 0.15, 68),
            (HEIGHT * 0.69, WIDTH * 0.48, HEIGHT * 0.13, 46),
            (HEIGHT * 0.82, WIDTH * 0.74, HEIGHT * 0.12, 34),
        )
    ):
        center_x = WIDTH * (0.38 + index * 0.13) + drift * (1.0 if index % 2 else -0.7)
        draw.ellipse(
            (
                center_x - width / 2,
                center_y - height / 2,
                center_x + width / 2,
                center_y + height / 2,
            ),
            fill=opacity,
        )
    mask = mask.filter(ImageFilter.GaussianBlur(24))
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (247, 243, 234, 0))
    layer.putalpha(mask)
    return layer


def create_frame(
    progress: float,
    far: Image.Image,
    mid: Image.Image,
    foreground: Image.Image,
    notes: Image.Image,
    noise: Image.Image,
) -> Image.Image:
    frame = paper_base(noise)

    far_layer = resized_layer(
        far,
        1.05 + progress * 0.075,
        -16 * progress,
        -12 * progress,
    )
    mid_layer = resized_layer(
        mid,
        1.04 + progress * 0.105,
        10 * progress,
        -25 * progress,
    )
    foreground_layer = resized_layer(
        foreground,
        1.02 + progress * 0.14,
        15 * progress,
        -55 * progress,
    )

    frame = Image.alpha_composite(frame, with_alpha(far_layer, 0.73))
    frame = Image.alpha_composite(frame, with_alpha(mid_layer, 0.77))
    frame = Image.alpha_composite(frame, with_alpha(foreground_layer, 0.75))

    distant_amount = 0.06 + smoothstep(0.35, 0.92, progress) * 0.19
    notes_layer = resized_layer(notes, 1.02 + progress * 0.04, 38 * progress, -18 * progress)
    notes_layer.putalpha(
        ImageChops.multiply(
            notes_layer.getchannel("A"),
            Image.new("L", (WIDTH, HEIGHT), round(distant_amount * 255)),
        )
    )
    frame = Image.alpha_composite(frame, notes_layer)
    frame = Image.alpha_composite(frame, mist_layer(progress))

    return frame.convert("RGB")


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    far = Image.open(IMAGE_ROOT / "hero-far-layer.png").convert("RGBA")
    mid = Image.open(IMAGE_ROOT / "hero-mid-layer.png").convert("RGBA")
    foreground = Image.open(IMAGE_ROOT / "hero-foreground-layer.png").convert("RGBA")
    notes = notes_matte(Image.open(IMAGE_ROOT / "notes-hero.png"))
    noise = paper_noise()

    frames = []
    for index in range(FRAME_COUNT):
        progress = index / max(1, FRAME_COUNT - 1)
        frame_name = f"frame-{index:03d}.webp"
        frame_path = OUTPUT_ROOT / frame_name
        frame = create_frame(progress, far, mid, foreground, notes, noise)
        frame.save(frame_path, "WEBP", quality=78, method=6)
        frames.append(frame_name)

    manifest = {
        "width": WIDTH,
        "height": HEIGHT,
        "frames": frames,
        "source": "hero-far-layer.png + hero-mid-layer.png + hero-foreground-layer.png + notes-hero.png",
    }
    (OUTPUT_ROOT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"generated {len(frames)} frames in {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
