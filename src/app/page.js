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

const defaultCities = [
  { name: "Vancouver", country: "Canada", timezone: "America/Vancouver", abbreviation: "PDT", flag: "🇨🇦" },
  { name: "Ottawa", country: "Canada", timezone: "America/Toronto", abbreviation: "EDT", flag: "🇨🇦" },
  { name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", abbreviation: "ICT", flag: "🇹🇭" },
  { name: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", abbreviation: "ICT", flag: "🇻🇳" },
  { name: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", abbreviation: "MYT", flag: "🇲🇾" },
  { name: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", abbreviation: "WIB", flag: "🇮🇩" },
  { name: "Manila", country: "Philippines", timezone: "Asia/Manila", abbreviation: "PHT", flag: "🇵🇭" },
  { name: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", abbreviation: "CST", flag: "🇹🇼" },
  { name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", abbreviation: "JST", flag: "🇯🇵" },
  { name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", abbreviation: "KST", flag: "🇰🇷" },
]

export default function WorldTimePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [cities, setCities] = useState(defaultCities)

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
        // Save new order to localStorage
        localStorage.setItem('cityOrder', JSON.stringify(newOrder.map(city => city.name)))
        return newOrder
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="pt-8">
        <div className="max-w-prose mx-auto px-8">
          <div className="flex items-center justify-center gap-10">
            <h1 className="text-2xl font-bold text-gray-900">Currently</h1>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24">
                <AnalogClock
                  value={currentTime}
                  size={96}
                  renderNumbers={true}
                  renderMinuteMarks={true}
                  renderHourMarks={true}
                />
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-600">
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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}

function SortableCityTimeCard({ city, country, timezone, abbreviation, currentTime, flag }) {
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
      className="bg-white rounded-md shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md cursor-move"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">{city}</h2>
          <p className="text-gray-500 flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md py-0.5 px-1 text-xs">
            <span className="">{flag}</span>
            {country}
          </p>
        </div>
        <div className="flex items-center text-gray-400 text-xs">
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
        <p className="text-gray-500 text-sm mt-2">{localDate}</p>
      </div>
    </div>
  )
}
