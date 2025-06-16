package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"math"
	"net/http"
	"net/url"

	"github.com/disintegration/imaging"
	"github.com/skip2/go-qrcode"
)

func GenerateQRCode(url string, size int) ([]byte, error) {
	qr, err := qrcode.New(url, qrcode.High)
	if err != nil {
		return nil, err

	}
	qr.DisableBorder = false
	qrImg := qr.Image(size)
	var buf bytes.Buffer
	if err := png.Encode(&buf, qrImg); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil

}

// #TODO: Implement GenerateQRCodeWithLogos function

func GenerateQRCodeWithLogos(url string, logoPath string, size int) ([]byte, error) {
	qr, err := qrcode.New(url, qrcode.High)
	if err != nil {
		return nil, err
	}
	logoSize := size / 4

	qr.DisableBorder = false
	qrImg := qr.Image(size)
	rgbaQR := image.NewRGBA(qrImg.Bounds())

	white := image.NewUniform(image.White)
	draw.Draw(rgbaQR, qrImg.Bounds(), white, image.Point{}, draw.Src)
	draw.Draw(rgbaQR, qrImg.Bounds(), qrImg, image.Point{}, draw.Over)

	logoImg, err := downloadAndResizeImage(logoPath, logoSize)
	if err != nil {
		fmt.Println("Logo error:", err)
		return nil, err
	}
	// Center the logo
	offset := image.Pt(
		(size-logoImg.Bounds().Dx())/2,
		(size-logoImg.Bounds().Dy())/2,
	)
	draw.Draw(rgbaQR, logoImg.Bounds().Add(offset), logoImg, image.Point{}, draw.Over)
	var buf bytes.Buffer
	if err := png.Encode(&buf, rgbaQR); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func downloadAndResizeImage(logoURL string, size int) (image.Image, error) {
	parsed, err := url.Parse(logoURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return nil, fmt.Errorf("invalid logo URL: %w", err)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return nil, fmt.Errorf("unsupported URL scheme: %s", parsed.Scheme)
	}

	resp, err := http.Get(logoURL)
	if err != nil {
		return nil, fmt.Errorf("failed to download logo: %w", err)
	}
	defer resp.Body.Close()

	logoImg, _, err := image.Decode(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	logoImg = imaging.Resize(logoImg, size, size, imaging.Lanczos)
	logoImg = makeRounded(logoImg, float64(size)/6)
	return logoImg, nil
}

func makeRounded(img image.Image, radius float64) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()
	mask := image.NewAlpha(bounds)

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			// Distance from edges
			dx := math.Min(float64(x), float64(width-1-x))
			dy := math.Min(float64(y), float64(height-1-y))

			// If we're far from all corners, fully opaque
			if dx >= radius || dy >= radius {
				mask.SetAlpha(x, y, color.Alpha{A: 255})
				continue
			}

			// Check distance from curved corner
			dist := math.Hypot(radius-dx, radius-dy)
			if dist <= radius {
				mask.SetAlpha(x, y, color.Alpha{A: 255})
			} else {
				mask.SetAlpha(x, y, color.Alpha{A: 0})
			}
		}
	}

	// Apply the mask
	result := image.NewRGBA(bounds)
	draw.DrawMask(result, bounds, img, image.Point{}, mask, image.Point{}, draw.Over)
	return result
}
