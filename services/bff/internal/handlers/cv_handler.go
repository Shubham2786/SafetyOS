package handlers

import (
    "io"
    "log"
    "net/http"
    "os"

    "github.com/gin-gonic/gin"
)

type CVHandler struct {
    targetURL string
    client    *http.Client
}

func NewCVHandler() *CVHandler {
    url := os.Getenv("CV_SERVICE_URL")
    if url == "" {
        // default to localhost if not set
        url = "http://localhost:8002"
    }
    // Ensure trailing slash for path concatenation
    if url[len(url)-1] != '/' {
        url += "/"
    }
    return &CVHandler{targetURL: url, client: &http.Client{}}
}

// ProxyDetect forwards a multipart/form‑data image upload to the CV service.
func (h *CVHandler) ProxyDetect(c *gin.Context) {
    // Build request to CV service
    proxyReq, err := http.NewRequest("POST", h.targetURL+"detect", c.Request.Body)
    if err != nil {
        log.Printf("failed to create proxy request: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "proxy request creation failed"})
        return
    }
    // Copy headers (content type, etc.)
    proxyReq.Header = c.Request.Header.Clone()

    resp, err := h.client.Do(proxyReq)
    if err != nil {
        log.Printf("proxy request error: %v", err)
        c.JSON(http.StatusBadGateway, gin.H{"success": false, "error": "failed to contact CV service"})
        return
    }
    defer resp.Body.Close()

    // Relay status code and body back to caller
    body, _ := io.ReadAll(resp.Body)
    c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}
