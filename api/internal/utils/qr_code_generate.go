package utils

import (
	"bytes"
	"image/png"

	"github.com/skip2/go-qrcode"
)

func GenerateQRCode(url string, size int) ([]byte, error) {
	qr, err := qrcode.New(url, qrcode.High)
	if err != nil {
		return nil, err
	}
	qr.DisableBorder = false
	img := qr.Image(size)
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil

}
