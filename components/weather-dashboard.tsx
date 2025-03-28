"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudRain,
  Droplets,
  Wind,
  Sun,
  CloudSun,
  Umbrella,
  Loader2,
} from "lucide-react";
import { getWeatherAdvisory } from "@/lib/gemini";

// Define types
type AdvisoryItem = {
  crop: string;
  stage: string;
  advice: string;
};

type SoilMoistureItem = {
  field: string;
  crop: string;
  moisture: number;
};

type IrrigationRecommendation = {
  field: string;
  crop: string;
  advice: string;
};

type WeatherAdvisory = {
  advisory: AdvisoryItem[];
  irrigation: {
    soilMoisture: SoilMoistureItem[];
    recommendations: IrrigationRecommendation[];
  };
};

export function WeatherDashboard() {
  const [location, setLocation] = useState("New Delhi");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );
      const data = await response.json();

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      const weatherInfo = {
        current: {
          location: data.name,
          temperature: data.main.temp,
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          precipitation: data.rain ? data.rain["1h"] || 0 : 0,
          icon: getWeatherIcon(data.weather[0].main),
        },
        forecast: forecastData.list.slice(0, 7).map((item: any) => ({
          day: new Date(item.dt_txt).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temp: item.main.temp,
          condition: item.weather[0].description,
          icon: getWeatherIcon(item.weather[0].main),
        })),
      };

      setWeatherData(weatherInfo);

      // Get AI-generated advisory
      const aiAdvisory = await getWeatherAdvisory(weatherInfo);
      if (aiAdvisory) {
        setAdvisory(aiAdvisory);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case "clouds":
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case "rain":
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <CloudSun className="h-12 w-12 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Weather Dashboard</h2>
          <p className="text-muted-foreground">
            Personalized weather insights for your farm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter City"
            className="w-[180px]"
          />
          <Button onClick={fetchWeather} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      ) : weatherData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Current Weather</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    {weatherData.current.icon}
                    <div>
                      <h3 className="text-4xl font-bold">
                        {weatherData.current.temperature}°C
                      </h3>
                      <p className="text-muted-foreground">
                        {weatherData.current.condition}
                      </p>
                      <p className="text-sm">{weatherData.current.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <Droplets className="h-6 w-6 text-blue-500 mb-1" />
                      <span className="text-sm font-medium">
                        {weatherData.current.humidity}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Humidity
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Wind className="h-6 w-6 text-gray-500 mb-1" />
                      <span className="text-sm font-medium">
                        {weatherData.current.wind} km/h
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Wind
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Umbrella className="h-6 w-6 text-blue-500 mb-1" />
                      <span className="text-sm font-medium">
                        {weatherData.current.precipitation} mm
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Rain
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>7-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                  {weatherData.forecast.map((day: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 rounded-lg bg-muted"
                    >
                      <span className="font-medium mb-1">{day.day}</span>
                      {day.icon}
                      <span className="text-lg font-bold mt-1">
                        {day.temp}°C
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="advisory">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="advisory">Crop Advisory</TabsTrigger>
              <TabsTrigger value="irrigation">Irrigation Planning</TabsTrigger>
            </TabsList>
            <TabsContent
              value="advisory"
              className="p-4 border rounded-md mt-2"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Personalized Crop Advisory
                  </h3>
                  <p className="text-muted-foreground">
                    AI-generated recommendations based on current weather
                    conditions
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {advisory?.advisory.map(
                    (item: AdvisoryItem, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <h4 className="font-semibold mb-1">{item.crop}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Growth Stage: {item.stage}
                          </p>
                          <p className="text-sm">{item.advice}</p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="irrigation"
              className="p-4 border rounded-md mt-2"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Irrigation Planning
                  </h3>
                  <p className="text-muted-foreground">
                    AI-generated irrigation recommendations based on weather and
                    soil conditions
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Soil Moisture Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {advisory?.irrigation.soilMoisture.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span>
                                {item.field} ({item.crop})
                              </span>
                              <div className="w-1/2 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${item.moisture}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {item.moisture}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Irrigation Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {advisory?.irrigation.recommendations.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-muted"
                            >
                              <h4 className="font-medium">
                                {item.field} ({item.crop})
                              </h4>
                              <p className="text-sm">{item.advice}</p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          Enter a city and click "Search" to view weather data.
        </div>
      )}
    </div>
  );
}

export default WeatherDashboard;
