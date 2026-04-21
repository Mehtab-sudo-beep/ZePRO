package com.zepro.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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
        }
    }

    public void sendPushNotification(String targetToken, String title, String body, Map<String, String> data) {
        if (targetToken == null || targetToken.isEmpty()) {
            System.out.println("[PushNotificationService] ⚠️ No push token available. Skipping.");
            return;
        }

        // Detect if it's an Expo token or FCM token
        if (targetToken.startsWith("ExponentPushToken")) {
            sendPushNotificationViaExpo(targetToken, title, body, data);
        } else {
            sendPushNotificationViaFirebase(targetToken, title, body, data);
        }
    }

    private void sendPushNotificationViaFirebase(String targetToken, String title, String body, Map<String, String> data) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(targetToken)
                    .setNotification(notification);
            
            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("[PushNotificationService] ✅ Successfully sent Firebase message: " + response);
        } catch (Exception e) {
            System.err.println("[PushNotificationService] ❌ Error sending Firebase notification: " + e.getMessage());
        }
    }

    private void sendPushNotificationViaExpo(String targetToken, String title, String body, Map<String, String> data) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("to", targetToken);
            payload.put("title", title);
            payload.put("body", body);
            payload.put("data", data);
            payload.put("sound", "default");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            String response = restTemplate.postForObject("https://exp.host/--/api/v2/push/send", request, String.class);
            System.out.println("[PushNotificationService] ✅ Successfully sent Expo message: " + response);
        } catch (Exception e) {
            System.err.println("[PushNotificationService] ❌ Error sending Expo notification: " + e.getMessage());
        }
    }
}
