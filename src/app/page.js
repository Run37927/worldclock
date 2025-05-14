"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
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
  { name: "Toronto", country: "Canada", timezone: "America/Toronto", abbreviation: "EDT", flag: "🇨🇦" },
  { name: "Ottawa", country: "Canada", timezone: "America/Toronto", abbreviation: "EDT", flag: "🇨🇦" },
  { name: "Beijing", country: "China", timezone: "Asia/Shanghai", abbreviation: "CST", flag: "🇨🇳" },
  { name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", abbreviation: "JST", flag: "🇯🇵" },
  { name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", abbreviation: "KST", flag: "🇰🇷" },
  { name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", abbreviation: "ICT", flag: "🇹🇭" },
  { name: "Bali", country: "Indonesia", timezone: "Asia/Makassar", abbreviation: "WITA", flag: "🇮🇩" },
  { name: "Sydney", country: "Australia", timezone: "Australia/Sydney", abbreviation: "AEST", flag: "🇦🇺" },
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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-8 py-12">
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
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md cursor-move"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{city}</h2>
          <p className="text-gray-500 flex items-center gap-1">
            <span className="text-xl">{flag}</span>
            {country}
          </p>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{abbreviation}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-light text-gray-800">{localTime}</p>
        <p className="text-gray-500 mt-2">{localDate}</p>
      </div>
    </div>
  )
}
