package req

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

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
	studentID := s.Param("id")
	action := s.Param("action")

	log.Println("action")

	accessToken := s.GetAccessToken()

	var strJSON string

	switch action {
	case "/glps", "/glps/":
		response, err := getStudentGLPS(studentID, accessToken)
		if err != nil {
			log.Println(err)
			return
		}
		strJSON = response
	default:
		response, err := getStudent(studentID, accessToken)
		if err != nil {
			log.Println(err)
			return
		}
		strJSON = response
	}

	s.Header("Content-Type", "application/json")
	s.String(http.StatusOK, strJSON)
}

func NewStudentRequest(path string) *StudentRequest {
	req := &StudentRequest{}
	req.SetPath(path)
	return req
}

func getStudent(studentID string, accessToken string) (string, error) {
	response, err := http.Get(fmt.Sprintf("https://core.beaconing.eu/api/students/%s?access_token=%s", studentID, accessToken))
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	strJSON := string(body)

	return strJSON, nil
}

func getStudentGLPS(studentID string, accessToken string) (string, error) {
	response, err := http.Get(fmt.Sprintf("https://core.beaconing.eu/api/students/%s/assignedGlps?access_token=%s", studentID, accessToken))
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}
