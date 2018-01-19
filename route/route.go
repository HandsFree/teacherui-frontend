package route

import (
	"git.juddus.com/HFC/beaconing/serv"
)

type Route interface {
	Handle(ctx *serv.SessionContext)

	GetManager() *RouteManager
	SetManager(m *RouteManager)

	GetPath() string
	SetPath(path string)
}

type SimpleManagedRoute struct {
	Route
	manager *RouteManager
	path    string
}

func (s *SimpleManagedRoute) SetManager(m *RouteManager) {
	s.manager = m
}

func (s *SimpleManagedRoute) GetManager() *RouteManager {
	return s.manager
}

func (s *SimpleManagedRoute) GetPath() string {
	return s.path
}

func (s *SimpleManagedRoute) SetPath(path string) {
	s.path = path
}
