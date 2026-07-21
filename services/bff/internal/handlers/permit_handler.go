package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type PermitToWork struct {
	ID           string    `json:"id"`
	PermitNumber string    `json:"permitNumber"`
	Type         string    `json:"type"`
	Status       string    `json:"status"`
	Title        string    `json:"title"`
	ZoneID       string    `json:"zoneId"`
	ValidFrom    time.Time `json:"validFrom"`
	ValidUntil   time.Time `json:"validUntil"`
}

type PermitHandler struct{}

func NewPermitHandler() *PermitHandler {
	return &PermitHandler{}
}

func (h *PermitHandler) ListPermits(c *gin.Context) {
	mockPermits := []PermitToWork{
		{
			ID:           "ptw-001",
			PermitNumber: "PTW-2026-9041",
			Type:         "HOT_WORK",
			Status:       "ACTIVE",
			Title:        "Pipe Flange Cutting & Welding",
			ZoneID:       "zone-4",
			ValidFrom:    time.Now().Add(-2 * time.Hour),
			ValidUntil:   time.Now().Add(6 * time.Hour),
		},
		{
			ID:           "ptw-002",
			PermitNumber: "PTW-2026-9042",
			Type:         "CONFINED_SPACE",
			Status:       "PENDING_APPROVAL",
			Title:        "Tank Vessel Inspection & Cleaning",
			ZoneID:       "zone-2",
			ValidFrom:    time.Now().Add(1 * time.Hour),
			ValidUntil:   time.Now().Add(9 * time.Hour),
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    mockPermits,
	})
}

func (h *PermitHandler) CreatePermit(c *gin.Context) {
	var req PermitToWork
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	req.ID = "ptw-" + time.Now().Format("20060102150405")
	req.Status = "DRAFT"

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    req,
	})
}
