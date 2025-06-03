package oauth

import (
	"api/configs"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type Provider string

const (
	PROVIDER_LOCAL   = "local"
	PROVIDER_GOOGLE  = "google"
	PROVIDER_GITHUB  = "github"
	PROVIDER_DISCORD = "discord"
)

var providers = map[Provider]OAuthProvider{}

func init() {
	providers[PROVIDER_GOOGLE] = &GoogleProvider{
		ClientID:     configs.GetGoogleClientID(),
		ClientSecret: configs.GetGoogleClientSecret(),
	}
}

type OAuthUser struct {
	Provider    string
	ProviderID  string
	Email       string
	Username    *string
	AvatarURL   *string
	AccessToken *string
	IdToken     *string
}

func GetProvider(provider Provider) (OAuthProvider, bool) {
	p, ok := providers[provider]
	return p, ok
}

type OAuthProvider interface {
	Callback(code string) (*OAuthUser, error)
	RedirectURL(provider Provider) (*url.URL, error)
}
type GoogleProvider struct {
	ClientID     string
	ClientSecret string
}

func GetCallbackUrl(provider Provider) string {
	return fmt.Sprintf("http://localhost:8080/api/auth/%s/callback", provider)
}

func (P *GoogleProvider) RedirectURL(provider Provider) (*url.URL, error) {
	redirectUrl, err := url.Parse("https://accounts.google.com/o/oauth2/v2/auth")
	if err != nil {
		return nil, err
	}
	query := redirectUrl.Query()
	query.Add("client_id", P.ClientID)
	query.Add("redirect_uri", GetCallbackUrl(provider))
	query.Add("response_type", "code")
	query.Add("scope", "openid email profile")
	redirectUrl.RawQuery = query.Encode()

	return redirectUrl, nil

}

type googleTokenResponse struct {
	AccessToken string `json:"access_token"`
	IdToken     string `json:"id_token"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

type googleUserInfoResponse struct {
	Email         string  `json:"email"`
	Name          *string `json:"name,omitempty"`
	Id            string  `json:"id"`
	Sub           string  `json:"sub"`
	Picture       *string `json:"picture,omitempty"`
	VerifiedEmail bool    `json:"verified_email"`
}

func (p *GoogleProvider) Callback(code string) (*OAuthUser, error) {
	const (
		tokenURL    = "https://oauth2.googleapis.com/token"
		userInfoURL = "https://www.googleapis.com/oauth2/v3/userinfo"
	)
	var tokenResponse googleTokenResponse

	tokenValue := url.Values{}
	tokenValue.Add("code", code)
	tokenValue.Add("client_id", p.ClientID)
	tokenValue.Add("client_secret", p.ClientSecret)
	tokenValue.Add("redirect_uri", GetCallbackUrl(PROVIDER_GOOGLE))
	tokenValue.Add("grant_type", "authorization_code")

	res, err := http.PostForm(tokenURL, tokenValue)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if err := json.NewDecoder(res.Body).Decode(&tokenResponse); err != nil {
		return nil, err
	}

	var userInfoResp googleUserInfoResponse
	req, err := http.NewRequest("GET", userInfoURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+tokenResponse.AccessToken)
	res2, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res2.Body.Close()
	if err := json.NewDecoder(res2.Body).Decode(&userInfoResp); err != nil {
		return nil, err
	}

	return &OAuthUser{
		Provider:    PROVIDER_GOOGLE,
		Email:       userInfoResp.Email,
		ProviderID:  userInfoResp.Sub,
		Username:    userInfoResp.Name,
		AvatarURL:   userInfoResp.Picture,
		AccessToken: &tokenResponse.AccessToken,
		IdToken:     &tokenResponse.IdToken,
	}, nil
}
