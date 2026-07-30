package promptforge

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Client struct {
	APIKey  string
	BaseURL string
}

func (c *Client) Compile(idea, targetAssistant string) (map[string]interface{}, error) {
	body, _ := json.Marshal(map[string]string{"idea": idea, "targetAssistant": targetAssistant})
	req, _ := http.NewRequest("POST", c.BaseURL+"/compile", bytes.NewBuffer(body))
	req.Header.Set("X-API-Key", c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}
