package com.zepro.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Map;

@Service
public class PushNotificationService {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = new ClassPathResource("firebase-adminsdk.json").getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("[PushNotificationService] ✅ Firebase Admin SDK initialized successfully.");
            }
        } catch (Exception e) {
            System.err.println("[PushNotificationService] ❌ Failed to initialize Firebase Admin SDK: " + e.getMessage());
            // Optionally, handle gracefully if the file is missing during development
        }
    }

    public void sendPushNotification(String targetToken, String title, String body, Map<String, String> data) {
        if (targetToken == null || targetToken.isEmpty()) {
            System.out.println("[PushNotificationService] ⚠️ No push token available. Skipping push notification.");
            return;
        }

        try {
            // Build the Firebase Notification payload
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            // Build the complete message
            Message.Builder messageBuilder = Message.builder()
                    .setToken(targetToken)
                    .setNotification(notification);
            
            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();

            // Send via Firebase Messaging
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("[PushNotificationService] ✅ Successfully sent message: " + response);

        } catch (Exception e) {
            System.err.println("[PushNotificationService] ❌ Error sending push notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
