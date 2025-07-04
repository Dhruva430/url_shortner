package utils

import "encoding/base64"

func EncodeToBase64(data []byte) string {
	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(data)
}
