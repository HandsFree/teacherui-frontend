package req

import (
	"encoding/gob"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/lib/pq"

	"github.com/HandsFree/beaconing-teacher-ui/backend/api"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/olekukonko/tablewriter"
)

func init() {
	gob.Register(map[int]bool{})
}

// Assign's a student to the given GLP
//
// inputs:
// - student id
// - glp id
func GetAssignRequest() gin.HandlerFunc {
	return func(s *gin.Context) {
		studentID := s.Param("student")
		studentIDValue, err := strconv.ParseUint(studentID, 10, 64)
		if err != nil || studentIDValue < 0 {
			s.String(http.StatusBadRequest, "Client Error: Invalid student ID")
			return
		}

		glpID := s.Param("glp")
		glpIDValue, err := strconv.ParseUint(glpID, 10, 64)
		if err != nil || glpIDValue < 0 {
			s.String(http.StatusBadRequest, "Client Error: Invalid GLP ID")
			return
		}

		// FIXME clean this up.

		fromParam := s.Param("from")

		var from pq.NullTime
		if fromParam != "" {
			fromTime, err := time.Parse(time.RFC3339, fromParam)
			if err != nil {
				log.Println("assign from time is bad", err.Error())
				fromTime = time.Now()

				// we aren't going to error here since we can
				// just say it's been assigned from the current
				// time.
			}
			from = pq.NullTime{Time: fromTime, Valid: true}
		} else {
			from = pq.NullTime{Time: time.Now(), Valid: true}
		}

		toParam := s.Param("to")

		var to pq.NullTime
		if toParam != "" {
			toTime, err := time.Parse(time.RFC3339, toParam)
			if err != nil {
				log.Println("assign to time is bad", err.Error())
				s.AbortWithError(http.StatusBadRequest, err)
				return
			}
			to = pq.NullTime{toTime, true}
		}

		// register the GLP in the session
		registerGLP(s, glpIDValue)

		// do the post request to the beaconing API
		// saying we're assigning said student to glp.
		resp, err := api.AssignStudentToGLP(s, studentIDValue, glpIDValue, from, to)
		if err != nil {
			s.String(http.StatusBadRequest, "Failed to assign student to glp")
			return
		}

		s.Header("Content-Type", "application/json")
		s.String(http.StatusOK, resp)
	}
}

func GetGroupAssignRequest() gin.HandlerFunc {
	return func(s *gin.Context) {
		groupID := s.Param("group")
		groupIDValue, err := strconv.ParseUint(groupID, 10, 64)
		if err != nil || groupIDValue < 0 {
			s.String(http.StatusBadRequest, "Client Error: Invalid group ID")
			return
		}

		glpID := s.Param("glp")
		glpIDValue, err := strconv.ParseUint(glpID, 10, 64)
		if err != nil || glpIDValue < 0 {
			s.String(http.StatusBadRequest, "Client Error: Invalid GLP ID")
			return
		}

		fromParam := s.Param("from")
		from, err := time.Parse(time.RFC3339, fromParam)
		if err != nil {
			log.Println("assign from time is bad", err.Error())
			from = time.Now()

			// we aren't going to error here since we can
			// just say it's been assigned from the current
			// time.
		}

		toParam := s.Param("to")
		var to time.Time
		if toParam != "" {
			var err error
			to, err = time.Parse(time.RFC3339, toParam)
			if err != nil {
				log.Println("assign to time is bad", err.Error())
				s.AbortWithError(http.StatusBadRequest, err)
				return
			}
		}

		log.Println("THIS IS A GROUP ASSIGN REQUEST ! ", groupIDValue, glpIDValue)

		registerGLP(s, glpIDValue)

		resp, err := api.AssignGroupToGLP(s, groupIDValue, glpIDValue, from, to)
		if err != nil {
			s.String(http.StatusBadRequest, "Failed to assign group to glp")
			return
		}

		s.Header("Content-Type", "application/json")
		s.String(http.StatusOK, resp)
	}
}

// registerGLP...
// this is a temporary demo thing, basically when we assign
// a glp, we store it in a hash set
func registerGLP(s *gin.Context, glpID uint64) {
	session := sessions.Default(s)

	assignedPlans := session.Get("assigned_plans")

	if assignedPlans == nil {
		log.Println("session assigned_plans doesn't exist")
	}

	assignedPlansTable := map[uint64]bool{}
	if assignedPlans != nil {
		log.Println("restoring old ALP assignments table from session")
		assignedPlansTable, _ = assignedPlans.(map[uint64]bool)
	}

	// TODO: if we want to sort by time we should probably
	// do this here, as well as we need to store the current time
	// right now because there is no time.

	// because we dont want to store duplicates we
	// store these in a hashset-type thing
	assignedPlansTable[glpID] = true

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"GLP"})
	for id := range assignedPlansTable {
		table.Append([]string{fmt.Sprintf("%d", id)})
	}
	table.Render()

	session.Set("assigned_plans", assignedPlansTable)
	if err := session.Save(); err != nil {
		log.Println("registerGLP", err.Error())
	}
}
