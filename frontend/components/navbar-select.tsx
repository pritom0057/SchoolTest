"use client"

import React, { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Wrapper component demonstrating a mounted-only Select alongside Navbar
export default function NavbarSelect() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return null

    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 py-4">
                <Select>
                    <SelectTrigger className="w-[180px]" aria-label="Example select">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="one">One</SelectItem>
                        <SelectItem value="two">Two</SelectItem>
                        <SelectItem value="three">Three</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
