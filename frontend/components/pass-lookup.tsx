"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Search, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { VisitorData } from "@/app/page"
import { API_BASE_URL } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

const lookupSchema = z.object({
  searchType: z.enum(["mobile", "id"]),
  value: z.string().min(3, "Search value is too short"),
})

export function PassLookup({ onSuccess }: { onSuccess: (data: VisitorData) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof lookupSchema>>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      searchType: "mobile",
      value: "",
    },
  })

  async function onSubmit(values: z.infer<typeof lookupSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      // Map searchType: "id" -> "visitorId", "mobile" -> "mobile"
      const searchType = values.searchType === "id" ? "visitorId" : "mobile"
      
      const response = await fetch(`${API_BASE_URL}/visitors/find-pass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchType: searchType,
          searchValue: values.value,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `Failed to find pass: ${response.statusText}`)
      }

      const found: VisitorData = responseData.data
      setIsLoading(false)
      
      toast({
        title: "Pass Found!",
        description: "Your visitor pass has been retrieved successfully.",
      })
      
      onSuccess(found)
    } catch (error) {
      console.error("Pass lookup error:", error)
      setIsLoading(false)
      
      const errorMessage = error instanceof Error ? error.message : "We couldn't find a pass with those details. Please check and try again or register for a new pass."
      setError(errorMessage)
      
      toast({
        title: "Pass Not Found",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="searchType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Search by</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex-1 cursor-pointer font-medium">
                        Mobile Number
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-xl flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="id" id="id" />
                      <Label htmlFor="id" className="flex-1 cursor-pointer font-medium">
                        Visitor ID
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{form.watch("searchType") === "mobile" ? "Mobile Number" : "Visitor ID"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={form.watch("searchType") === "mobile" ? "+1 234 567 8900" : "GTE-123456"}
                    className="h-14 text-lg bg-muted/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Find My Pass
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
