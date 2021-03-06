package fillers

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"
)

type cartRetriever struct {
	repo   string
	branch string

	outputPath string
}

type tmplData struct {
	Name string
	Path string
}

func (c cartRetriever) retrieve(name, path string) error {
	err := os.MkdirAll(filepath.Join(c.outputPath, path), 0666)
	if err != nil {
		return fmt.Errorf("cart retriever: couldn't create folder to hold files: %s", err)
	}

	err = c.downloadFile(path, true)
	if err != nil {
		return err
	}

	err = c.downloadFile(path, false)
	if err != nil {
		return err
	}

	buffer := bytes.NewBuffer(nil)

	err = templates.pico8Play.Execute(buffer, tmplData{
		Name: name,
		Path: path,
	})
	if err != nil {
		panic(err)
	}

	err = os.WriteFile(filepath.Join(c.outputPath, path, "index.html"), buffer.Bytes(), 066)
	if err != nil {
		return err
	}

	return nil
}

func (c cartRetriever) downloadFile(cartPath string, isHTML bool) error {
	ext := "js"
	if isHTML {
		ext = "html"
	}

	fileName := cartPath + "." + ext

	url := path.Join("raw.githubusercontent.com", c.repo, c.branch, cartPath, fileName)

	resp, err := http.Get("https://" + url)
	if err != nil {
		return fmt.Errorf("cart retriever: couldn't get %s %s file: %s", cartPath, ext, err)
	}

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("cart retriever: couldn't read %s %s file: %s", cartPath, ext, err)
	}

	err = os.WriteFile(filepath.Join(c.outputPath, cartPath, fileName), data, 0666)
	if err != nil {
		return fmt.Errorf("cart retriever: couldn't write %s %s file: %s", cartPath, ext, err)
	}

	return nil
}
