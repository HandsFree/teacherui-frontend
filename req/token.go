package req

import (
	"net/http"

	"github.com/gin-contrib/sessions"

	"git.juddus.com/HFC/beaconing/route"
	"git.juddus.com/HFC/beaconing/serv"
)

type TokenRequest struct {
	route.SimpleManagedRoute
}

func NewTokenRequest(path string) *TokenRequest {
	req := &TokenRequest{}
	req.SetPath(path)
	return req
}

func (r *TokenRequest) Handle(s *serv.SessionContext) {
	code := s.Query("code")
	if code == "" {
		// do something here!
		return
	}

	session := sessions.Default(s.Context)
	session.Set("code", code)
	if !s.GetAuthToken() {
		// some kind of failure here
		// 505 redirect?
		return
	}
	session.Save()
	s.Redirect(http.StatusTemporaryRedirect, "/")
}
