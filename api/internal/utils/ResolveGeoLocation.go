package utils

import (
	"log"
	"net"
	"strings"

	"github.com/ipinfo/go/v2/ipinfo"
)

func ResolveGeoLocation(ip string) (country string, region string, city string) {
	const token = "b3fceeda645f7a"

	client := ipinfo.NewClient(nil, nil, token)

	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		log.Printf("Invalid IP address: %s", ip)
		return "", "", ""
	}
	info, err := client.GetIPInfo(parsedIP)
	if err != nil {
		log.Printf("GeoIP lookup failed for IP %s: %v", ip, err)
		return "", "", ""
	}
	country = info.Country
	region = info.Region
	city = info.City
	return country, region, city
}

func DetectDeviceTypeUA(userAgent string) string {
	ua := strings.ToLower(userAgent)

	if strings.Contains(ua, "mobile") || strings.Contains(ua, "iphone") || strings.Contains(ua, "android") || strings.Contains(ua, "blackberry") {
		return "mobile"
	}
	if strings.Contains(ua, "ipad") || strings.Contains(ua, "tablet") || strings.Contains(ua, "applewebkit") {
		return "tablet"
	}

	if strings.Contains(ua, "macintosh") || strings.Contains(ua, "windows") || strings.Contains(ua, "linux") {
		return "desktop"
	}

	return "unknown"
}
