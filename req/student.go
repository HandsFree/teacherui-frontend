package req

import (
	"net/http"
	"strconv"

	"git.juddus.com/HFC/beaconing/api"
	"git.juddus.com/HFC/beaconing/route"
	"git.juddus.com/HFC/beaconing/serv"
)

type StudentRequest struct {
	route.SimpleManagedRoute
}

func (r *StudentRequest) Post(s *serv.SessionContext) {

}

func (r *StudentRequest) Delete(s *serv.SessionContext) {}

func (r *StudentRequest) Get(s *serv.SessionContext) {
	studentIDParam := s.Param("id")
	studentID, err := strconv.Atoi(studentIDParam)
	if err != nil {
		s.SimpleErrorRedirect(500, "ID thingy")
		return
	}

	response := api.GetStudent(s, studentID)
	s.Header("Content-Type", "application/json")
	s.String(http.StatusOK, response)
}

func NewStudentRequest(path string) *StudentRequest {
	req := &StudentRequest{}
	req.SetGET(path)
	return req
}
