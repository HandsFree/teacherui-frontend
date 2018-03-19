package api

import (
	"bytes"
	"log"
	"net/http"
	"time"

	"git.juddus.com/HFC/beaconing/backend/cfg"
	"git.juddus.com/HFC/beaconing/backend/types"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
)

// GetRefreshToken retrieves a refresh token from the beaconing
// core api. If all is well, the token will be set in the
// users session which can be referenced later.
func GetRefreshToken(s *gin.Context) error {
	session := sessions.Default(s)

	accessToken := session.Get("access_token").(string)

	message, err := jsoniter.Marshal(types.TokenRequest{
		GrantType:    "authorization_code",
		Code:         accessToken,
		ClientID:     cfg.Beaconing.Auth.ID,
		ClientSecret: cfg.Beaconing.Auth.Secret,
		RedirectURI:  RedirectBaseLink,
	})

	if err != nil {
		log.Println("GetRefreshToken", err.Error())
		return err
	}

	const tokenRefreshLink = "https://core.beaconing.eu/auth/token"
	resp, err := DoTimedRequestBody("POST", tokenRefreshLink, bytes.NewBuffer(message), 15*time.Second)
	if err != nil {
		log.Println("GetRefreshToken", err.Error())
		return err
	}

	var respToken types.TokenResponse
	if err := jsoniter.Unmarshal(resp, &respToken); err != nil {
		log.Println("GetRefreshToken", err.Error())
		return err
	}

	log.Println("Auth: Set access token!")
	session.Set("access_token", respToken.AccessToken)
	session.Set("refresh_token", respToken.RefreshToken)
	session.Set("token_type", respToken.TokenType)
	if err := session.Save(); err != nil {
		log.Println("GetRefreshToken", err.Error())
	}
	return nil
}

// GetAccessToken will return the access token as a string
// if there is no token set then we spit out an unauthorised
// access error.
func GetAccessToken(s *gin.Context) string {
	session := sessions.Default(s)
	accessToken := session.Get("access_token")
	if accessToken == nil {
		s.String(http.StatusBadRequest, "Unauthorised access")
		// NOTE: no return here due to redirect
		return ""
	}
	return accessToken.(string)
}

// TryRefreshToken is a shim for trying to refresh
// a token ... to be implemented at a later date.
func TryRefreshToken(s *gin.Context) error {
	err := GetRefreshToken(s)
	return err
}