package main

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const uploadDir = "./uploads"

func unzipSimpleFile(file *zip.File, filePath string) error {
	outFile, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer outFile.Close()

	fileInArchive, err := file.Open()
	if err != nil {
		return err
	}
	defer fileInArchive.Close()

	_, err = io.Copy(outFile, fileInArchive)
	if err != nil {
		return err
	}
	return nil
}

func unzipFile(zipPath, destDir string) error {
	zipReader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer zipReader.Close()

	for _, file := range zipReader.File {
		filePath := filepath.Join(destDir, file.Name)
		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(filePath, file.Mode()); err != nil {
				return err
			}
		} else {
			err = unzipSimpleFile(file, filePath)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func randFileName() string {
	return uuid.New().String()
}

func main() {
	r := gin.Default()
	r.LoadHTMLGlob("templates/*")

	r.GET("/flag", func(c *gin.Context) {
		xForwardedFor := c.GetHeader("X-Forwarded-For")

		if !strings.Contains(xForwardedFor, "127.0.0.1") {
			c.JSON(400, gin.H{"error": "only localhost can get flag"})
			return
		}

		flag := os.Getenv("FLAG")
		if flag == "" {
			flag = "flag{testflag}"
		}

		c.String(http.StatusOK, flag)
	})

	r.GET("/public/index", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	r.POST("/public/upload", func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(400, gin.H{"error": "File upload failed"})
			return
		}

		randomFolder := randFileName()
		destDir := filepath.Join(uploadDir, randomFolder)

		if err := os.MkdirAll(destDir, 0755); err != nil {
			c.JSON(500, gin.H{"error": "Failed to create directory"})
			return
		}

		zipFilePath := filepath.Join(uploadDir, randomFolder+".zip")
		if err := c.SaveUploadedFile(file, zipFilePath); err != nil {
			c.JSON(500, gin.H{"error": "Failed to save uploaded file"})
			return
		}

		if err := unzipFile(zipFilePath, destDir); err != nil {
			c.JSON(500, gin.H{"error": "Failed to unzip file"})
			return
		}

		c.JSON(200, gin.H{
			"message": fmt.Sprintf("File uploaded and extracted successfully to %s", destDir),
		})
	})

	r.Run(":8080")
}
