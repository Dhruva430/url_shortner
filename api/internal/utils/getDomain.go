package utils

import (
	"database/sql"
	"net/url"
)

func FormatNullTime(nt sql.NullTime) string {
	if nt.Valid {
		return nt.Time.Format("02 Jan 2006")
	}
	return ""
}

func GetDomain(rawURL string) (string, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return "", err
	}
	return parsed.Scheme + "://" + parsed.Host, nil
}

func GetString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func NullToStr(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}
