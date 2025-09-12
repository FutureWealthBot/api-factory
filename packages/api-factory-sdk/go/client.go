package af

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type Client struct {
	BaseURL string
	APIKey  string
}

func New(baseURL, apiKey string) *Client {
	return &Client{BaseURL: baseURL, APIKey: apiKey}
}

func (c *Client) GetCampaigns() (*http.Response, error) {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/marketing/campaigns", nil)
	if err != nil {
		return nil, err
	}
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}
	return http.DefaultClient.Do(req)
}

func (c *Client) Generate(prompt string) (*http.Response, error) {
	body, err := json.Marshal(map[string]string{"prompt": prompt})
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/marketing/generate", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}
	return http.DefaultClient.Do(req)
}
