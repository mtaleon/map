#!/bin/bash
# Generate Android icons from favicon.svg

set -e

SVG="favicon.svg"
TEMP_PNG="temp_icon_base.png"

# First convert SVG to high-res PNG using qlmanage
echo "Converting SVG to base PNG..."
qlmanage -t -s 1024 -o . "$SVG" 2>/dev/null || true
mv "favicon.svg.png" "$TEMP_PNG" 2>/dev/null || {
    echo "Error: Failed to convert SVG to PNG"
    exit 1
}

echo "Generating launcher icons..."

# mdpi
sips -z 48 48 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" >/dev/null
cp "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
sips -z 108 108 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png" >/dev/null
echo "  Generated mdpi icons (48x48, foreground: 108x108)"

# hdpi
sips -z 72 72 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" >/dev/null
cp "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
sips -z 162 162 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png" >/dev/null
echo "  Generated hdpi icons (72x72, foreground: 162x162)"

# xhdpi
sips -z 96 96 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" >/dev/null
cp "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
sips -z 216 216 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png" >/dev/null
echo "  Generated xhdpi icons (96x96, foreground: 216x216)"

# xxhdpi
sips -z 144 144 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" >/dev/null
cp "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
sips -z 324 324 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png" >/dev/null
echo "  Generated xxhdpi icons (144x144, foreground: 324x324)"

# xxxhdpi
sips -z 192 192 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" >/dev/null
cp "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"
sips -z 432 432 "$TEMP_PNG" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png" >/dev/null
echo "  Generated xxxhdpi icons (192x192, foreground: 432x432)"

# Clean up
rm "$TEMP_PNG"

echo ""
echo "✓ All Android icons generated successfully!"
echo ""
echo "Icon densities created:"
echo "  mdpi:    48x48   (foreground: 108x108)"
echo "  hdpi:    72x72   (foreground: 162x162)"
echo "  xhdpi:   96x96   (foreground: 216x216)"
echo "  xxhdpi:  144x144 (foreground: 324x324)"
echo "  xxxhdpi: 192x192 (foreground: 432x432)"
