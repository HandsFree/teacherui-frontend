package serv

import (
	"git.juddus.com/HFC/beaconing/backend/req"
	"github.com/gin-gonic/gin"
)

func registerAPI(router *gin.Engine) {
	// ---
	// GIN WRAPPERS: API
	// ---

	v1 := router.Group("/api/v1/")

	authAPI := v1.Group("auth")
	{
		authAPI.GET("gettoken", req.GetCheckAuthRequest())
	}

	tokens := v1.Group("token")
	{
		tokens.GET("/", req.GetTokenRequest())
	}

	assign := v1.Group("assign")
	{
		assign.GET("/:student/to/:glp", req.GetAssignRequest())
	}

	assignGroup := v1.Group("assigngroup")
	{
		assignGroup.GET("/:group/to/:glp", req.GetGroupAssignRequest())
	}

	student := v1.Group("student")
	{
		student.GET("/:id", req.GetStudentRequest())
		student.PUT("/:id", req.PutStudentRequest())
		student.DELETE("/:id", req.DeleteStudentRequest())
		student.POST("/", req.PostStudentRequest())

		student.GET("/:id/assignedglps", req.GetAssignedGLPsRequest())
		student.DELETE("/:id/assignedglps/:glp", req.DeleteAssignedGLPsRequest())
	}

	students := v1.Group("students")
	{
		students.GET("/", req.GetStudentsRequest())
		students.GET("/:id/assignedglps", req.GetAssignedGLPsRequest())
		students.DELETE("/:id/assignedglps/:glp", req.DeleteAssignedGLPsRequest())

		// TODO!
		// PUT
		// POST id/assigned glps
		// students.POST("/", req.PostStudentsRequest())
	}

	profile := v1.Group("profile")
	{
		profile.GET("/", req.GetProfileRequest())
		profile.PUT("/", req.PutProfileRequest())
	}

	glps := v1.Group("glps")
	{
		glps.GET("/", req.GetGLPSRequest())
	}

	glp := v1.Group("glp")
	{
		glp.GET("/:id", req.GetGLPRequest())
		glp.DELETE("/:id", req.DeleteGLPRequest())
		glp.POST("/", req.PostGLPRequest())
	}

	studentGroups := v1.Group("studentgroups")
	{
		studentGroups.GET("/", req.GetStudentGroupsRequest())
	}

	studentGroup := v1.Group("studentgroup")
	{
		studentGroup.GET("/:id", req.GetStudentGroupRequest())
		studentGroup.PUT("/:id", req.PutStudentGroupRequest())
		studentGroup.GET("/:id/assignedglps", req.GetStudentGroupAssignedRequest())
		studentGroup.DELETE("/:id/assignedglps/:glp", req.DeleteGroupAssignedRequest())
		studentGroup.POST("/", req.PostStudentGroupRequest())
		studentGroup.DELETE("/:id", req.DeleteStudentGroupRequest())
	}

	v1.POST("search", req.PostSearchRequest())
}
