package req

import (
	"net/http"

	"git.juddus.com/HFC/beaconing/api"
	"git.juddus.com/HFC/beaconing/paths"
	"git.juddus.com/HFC/beaconing/route"
	"git.juddus.com/HFC/beaconing/serv"
)

type StudentsRequest struct {
	route.SimpleManagedRoute
}

func (r *StudentsRequest) Post(s *serv.SessionContext) {}

func (r *StudentsRequest) Delete(s *serv.SessionContext) {}

func (r *StudentsRequest) Get(s *serv.SessionContext) {
	resp, err := api.GetStudents(s)
	if err != nil {
		s.SimpleErrorRedirect(6969, "oh boy! "+err.Error())
		return
	}
	s.Header("Content-Type", "application/json")
	s.String(http.StatusOK, resp)
}

func NewStudentsRequest(p paths.PathSet) *StudentsRequest {
	req := &StudentsRequest{}
	req.SetPaths(p)
	return req
}
