#include <Arduino.h>
#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

const char* mqtt_server   = "broker.hivemq.com";
const int   mqtt_port     = 1883;

const char* topic_sensor  = "Sensor_ha";
const char* topic_control = "Device_control_ha";
const char* topic_respond = "Device_respond_ha";

#define SDA_PIN D2
#define SCL_PIN D1

#define DHT_PIN D5
#define DHT_TYPE DHT11

#define LED_1 D0
#define LED_2 D7
#define LED_3 D6


DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;


bool led1_auto = true;
bool led2_auto = true;
bool led3_auto = true;

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastRead = 0;

void publishDeviceRespond() {
    if (client.connected()) {
        JsonDocument doc;
        doc["LED1"] = (digitalRead(LED_1) == HIGH) ? "ON" : "OFF";
        doc["LED2"] = (digitalRead(LED_2) == HIGH) ? "ON" : "OFF";
        doc["LED3"] = (digitalRead(LED_3) == HIGH) ? "ON" : "OFF";
        char buffer[128];
        serializeJson(doc, buffer, sizeof(buffer));
        client.publish(topic_respond, buffer, true);
        Serial.print("MQTT Device Respond: ");
        Serial.println(buffer);
    }
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("MQTT message [");
    Serial.print(topic);
    Serial.print("]: ");
    for (unsigned int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
    // Chỉ xử lý topic điều khiển
    if (strcmp(topic, topic_control) != 0) {
        return;
    }
    // ================= JSON =================
    JsonDocument doc;
    DeserializationError error =
        deserializeJson(doc, payload, length);
    if (error) {
        Serial.print("deserializeJson failed: ");
        Serial.println(error.f_str());
        return;
    }

    bool changed = false;

    if (!doc["LED1"].isNull()) {
        const char* val = doc["LED1"];
        if (strcmp(val, "AUTO") == 0) {
            led1_auto = true;
            Serial.println("LED 1 -> AUTO");
        } else {
            led1_auto = false;
            digitalWrite(
                LED_1,
                strcmp(val, "ON") == 0 ? HIGH : LOW
            );
            Serial.printf(
                "LED 1 -> %s\n",
                val
            );
        }
        changed = true;
    }


    if (!doc["LED2"].isNull()) {
        const char* val = doc["LED2"];
        if (strcmp(val, "AUTO") == 0) {
            led2_auto = true;
            Serial.println("LED 2 -> AUTO");
        } else {

            led2_auto = false;

            digitalWrite(
                LED_2,
                strcmp(val, "ON") == 0 ? HIGH : LOW
            );
            Serial.printf(
                "LED 2 -> %s\n",
                val
            );
        }
        changed = true;
    }


    if (!doc["LED3"].isNull()) {

        const char* val = doc["LED3"];

        if (strcmp(val, "AUTO") == 0) {
            led3_auto = true;
            Serial.println("LED 3 -> AUTO");
        } else {
            led3_auto = false;
            digitalWrite(
                LED_3,
                strcmp(val, "ON") == 0 ? HIGH : LOW
            );
            Serial.printf(
                "LED 3 -> %s\n",
                val
            );
        }
        changed = true;
    }
    if (changed) {
        publishDeviceRespond();
    }
}

void checkAndControlSensors(float temp, float humid, float lux){
    bool changed = false;
    if (led1_auto && !isnan(temp)) {
        bool curState =
            (digitalRead(LED_1) == HIGH);
        bool newState = curState;
        if (temp > 30.5) {
            newState = true;
        } else if (temp < 30.5) {
            newState = false;
        }
        if (newState != curState) {
            digitalWrite(
                LED_1,
                newState ? HIGH : LOW
            );
            changed = true;
            Serial.print("AUTO LED1 -> ");
            Serial.println(
                newState ? "ON" : "OFF"
            );
        }
    }

    if (led2_auto && !isnan(humid)) {
        bool curState =
            (digitalRead(LED_2) == HIGH);
        bool newState = curState;
        if (humid > 31.0) {
            newState = true;
        } else if (humid < 29.0) {
            newState = false;
        }

        if (newState != curState) {
            digitalWrite(
                LED_2,
                newState ? HIGH : LOW
            );

            changed = true;

            Serial.print("AUTO LED2 -> ");
            Serial.println(
                newState ? "ON" : "OFF"
            );
        }
    }

    if (led3_auto && !isnan(lux) && lux >= 0) {
        bool curState =
            (digitalRead(LED_3) == HIGH);

        bool newState = curState;
        if (lux < 95.0) {
            newState = true;
        } else if (lux > 105.0) {
            newState = false;
        }

        if (newState != curState) {
            digitalWrite(
                LED_3,
                newState ? HIGH : LOW
            );

            changed = true;
            Serial.print("AUTO LED3 -> ");
            Serial.println(
                newState ? "ON" : "OFF"
            );
        }
    }

    if (changed) {
        publishDeviceRespond();
    }
}

void reconnectMQTT() {
    while (!client.connected()) {
        Serial.print("Connecting to MQTT...");
        String clientId = "ESP8266-";
        clientId += String(ESP.getChipId());
        if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
            Serial.println(" connected!");
            client.subscribe(topic_control);
            Serial.print("Subscribed: ");
            Serial.println(topic_control);
            publishDeviceRespond();
        } else {
            Serial.print(" failed, rc=");
            Serial.print(client.state());
            Serial.println(" -> thu lai sau 5 giay");
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println();
    Serial.println("==============================");
    Serial.println("ESP8266 DHT11 + BH1750 + MQTT");

    pinMode(LED_1, OUTPUT);
    pinMode(LED_2, OUTPUT);
    pinMode(LED_3, OUTPUT);

    digitalWrite(LED_1, LOW);
    digitalWrite(LED_2, LOW);
    digitalWrite(LED_3, LOW);

    Wire.begin(
        SDA_PIN,
        SCL_PIN
    );

    if (
        lightMeter.begin(
            BH1750::CONTINUOUS_HIGH_RES_MODE
        )
    ) {
        Serial.println(
            "BH1750: San sang!"
        );
    } else {
        Serial.println(
            "BH1750: Loi! Kiem tra day noi."
        );
    }

    dht.begin();
    Serial.println(
        "DHT11: San sang!"
    );

    Serial.print(
        "Connecting to WiFi: "
    );
    Serial.println(ssid);
    WiFi.begin(
        ssid,
        password
    );
    while (
        WiFi.status() != WL_CONNECTED
    ) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.println(
        "WiFi Connected!"
    );
    Serial.print(
        "IP: "
    );
    Serial.println(
        WiFi.localIP()
    );

    client.setServer(
        mqtt_server,
        1883
    );
    client.setCallback(
        callback
    );
    Serial.println(
        "MQTT ready!"
    );
}

void loop() {
    
    if (!client.connected()) {
        reconnectMQTT();
    }
    client.loop();
    if (
        millis() - lastRead >= 3000
    ) {
        lastRead = millis();

        float humid = dht.readHumidity();
        float temp = dht.readTemperature();
        float lux =
            lightMeter.readLightLevel();
        if (isnan(lux) || lux < 0) {
            lux = 0.0;
        }

        if (!isnan(temp) && !isnan(humid)) {
            Serial.printf(
                "[Sensor] Temp: %.1f C | Hum: %.1f %% | Lux: %.1f lx\n",
                temp,
                humid,
                lux
            );

            JsonDocument doc;
            doc["temperature"] = temp;
            doc["humidity"] = humid;
            doc["lux"] = lux;
            char sensorBuffer[128];
            serializeJson(doc, sensorBuffer, sizeof(sensorBuffer));

            client.publish(topic_sensor, sensorBuffer);
            Serial.print("MQTT Sensor: ");
            Serial.println(sensorBuffer);

            checkAndControlSensors(temp, humid, lux);
        } else {
            Serial.println("[Sensor] Loi doc DHT11!");
        }
    }
}