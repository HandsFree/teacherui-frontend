package serv

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"git.juddus.com/HFC/beaconing/cfg"
	"git.juddus.com/HFC/beaconing/json"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
)

func AuthRedirect(c *gin.Context) {
	authLink := fmt.Sprintf("https://core.beaconing.eu/auth/auth?response_type=code%s%s%s%s",
		"&client_id=", cfg.Beaconing.Auth.ID,
		"&redirect_uri=", RedirectBaseLink)
	c.Redirect(http.StatusTemporaryRedirect, authLink)
}

func GetRefreshToken(s *SessionContext) error {
	session := sessions.Default(s.Context)

	accessToken := session.Get("access_token").(string)

	message, err := jsoniter.Marshal(json.TokenRequest{
		GrantType:    "authorization_code",
		Code:         accessToken,
		ClientID:     cfg.Beaconing.Auth.ID,
		ClientSecret: cfg.Beaconing.Auth.Secret,
		RedirectURI:  RedirectBaseLink,
	})

	if err != nil {
		log.Fatal(err)
		return err
	}

	const tokenRefreshLink = "https://core.beaconing.eu/auth/token"
	response, err := http.Post(tokenRefreshLink, "application/json", bytes.NewBuffer(message))
	if err != nil {
		log.Fatal(err)
		return err
	}

	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
		return err
	}

	var respToken json.TokenResponse
	if err := jsoniter.Unmarshal(body, &respToken); err != nil {
		log.Fatal(err)
		return err
	}

	session.Set("access_token", respToken.AccessToken)
	session.Set("refresh_token", respToken.RefreshToken)
	session.Set("token_type", respToken.TokenType)
	session.Save()
	return nil
}

// rename this function!
func (s *SessionContext) GetAccessToken(redirectPath string) string {
	session := sessions.Default(s.Context)
	accessToken := session.Get("access_token")
	if accessToken == nil {
		s.SimpleErrorRedirect(401, "Unauthorised access")
		// NOTE: no return here due to redirect
	}
	return accessToken.(string)
}

func (s *SessionContext) TryRefreshToken() error {
	err := GetRefreshToken(s)
	return err
}
