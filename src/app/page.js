"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import AnalogClock from 'react-clock'
import 'react-clock/dist/Clock.css'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { defaultCities } from "@/lib/constant"

export default function WorldTimePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [cities, setCities] = useState(defaultCities)
  const [currentLocation, setCurrentLocation] = useState("")

  // Get current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            )
            const data = await response.json()
            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.county
              setCurrentLocation(city ? `${city}, ` : "")
            }
          } catch (error) {
            console.error("Error getting location:", error)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  // Load saved city order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('cityOrder')
    if (savedOrder) {
      const order = JSON.parse(savedOrder)
      // Reorder cities based on saved order
      const reorderedCities = order.map(cityName =>
        defaultCities.find(city => city.name === cityName)
      ).filter(Boolean)
      setCities(reorderedCities)
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      setCities((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id)
        const newIndex = items.findIndex((item) => item.name === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)

        localStorage.setItem('cityOrder', JSON.stringify(newOrder.map(city => city.name)))
        return newOrder
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="pt-8 sticky top-0 z-50 bg-white">
        <div className="mx-auto">
          <div className="flex justify-center items-center gap-3">
            <div className="w-32 h-32">
              <AnalogClock
                value={currentTime}
                size={110}
                renderNumbers={true}
                renderMinuteMarks={true}
                renderHourMarks={true}
              />
            </div>

            <div className="text-right">
              <p className="text-lg text-gray-800">
                {currentLocation}
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }).format(currentTime)}
              </p>
              <p className="text-gray-500 mt-1 text-sm">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }).format(currentTime)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 pt-8 pb-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cities.map(city => city.name)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <SortableCityTimeCard
                  key={city.name}
                  city={city.name}
                  country={city.country}
                  timezone={city.timezone}
                  abbreviation={city.abbreviation}
                  currentTime={currentTime}
                  flag={city.flag}
                  image={city.image}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}

function SortableCityTimeCard({ city, country, timezone, abbreviation, currentTime, flag, image }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: city })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const localTime = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(currentTime)

  const localDate = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentTime)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative bg-white rounded-md shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md cursor-move overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-white/5" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">{city}</h2>
            <p className="text-gray-500 flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-md py-0.5 px-1 text-xs">
              <span className="">{flag}</span>
              {country}
            </p>
          </div>
          <div className="flex items-center text-gray-800 text-xs">
            <Clock className="h-4 w-4 mr-1" />
            <span>{abbreviation}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="w-32 h-32 mb-4">
            <AnalogClock
              value={new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }))}
              size={128}
              renderNumbers={true}
              renderMinuteMarks={true}
              renderHourMarks={true}
            />
          </div>
          <p className="text-gray-800 text-sm mt-2 font-medium">{localDate}</p>
        </div>
      </div>
    </div>
  )
}
