package com.zepro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String saveFile(String subDirectory, MultipartFile multipartFile) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = StringUtils.cleanPath(multipartFile.getOriginalFilename());
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }

        String fileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        try (InputStream inputStream = multipartFile.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + fileName, ioe);
        }

        // Return relative path to be stored and served
        return "/" + uploadDir + "/" + subDirectory + "/" + fileName;
    }
}
