package req

import (
	"net/http"

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

	s.TokenStore.Set("code", code)
	if !s.GetAuthToken() {
		// some kind of failure here
		// 505 redirect?
		return
	}
	s.Redirect(http.StatusTemporaryRedirect, "/")
}
