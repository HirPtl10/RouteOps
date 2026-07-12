"use client";

import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "V-1001",
    reason: "Routine oil change and brake inspection",
    severity: "low",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Decorative top accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900" />

      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-950">TransitOps</h1>
              <p className="text-xs text-slate-500 font-medium">Design System & UI Foundation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="success">Phase 1 Active</Badge>
            <Badge variant="outline">v0.1.0</Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 mt-12 grid gap-10">
        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Shared Design System</h2>
          <p className="max-w-3xl text-slate-600 leading-relaxed">
            Welcome to the initial UI foundation of TransitOps. This gallery showcases our primary, lightweight UI components built using Next.js, React, Tailwind CSS v4, and TypeScript. Developers should reuse these patterns to maintain UI consistency.
          </p>
        </section>

        {/* Buttons section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Flexible button actions supporting primary, secondary, outline, destructive, ghost, and link variants.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Border</Button>
              <Button variant="destructive">Destructive Action</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Style</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small Size</Button>
              <Button size="md">Medium (Default)</Button>
              <Button size="lg">Large Size</Button>
              <Button variant="outline" size="icon" aria-label="Settings">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
              <Button isLoading variant="primary">Saving State</Button>
              <Button disabled variant="primary">Disabled Action</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Status</CardTitle>
            <CardDescription>
              Status indicators to represent system states (e.g., Vehicle and Maintenance status).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">AVAILABLE / success</Badge>
            <Badge variant="warning">IN_SHOP / warning</Badge>
            <Badge variant="destructive">RETIRED / destructive</Badge>
            <Badge variant="outline">Outline badge</Badge>
          </CardContent>
        </Card>

        {/* Interactive Sandbox Form */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Interactive Demo: Create Maintenance Record</CardTitle>
                <CardDescription>
                  This form uses the Input, Label, Select, Textarea, and Button components to demonstrate real-time states.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {formSubmitted && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center space-x-2 animate-pulse">
                      <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Success! Maintenance record mock-submitted successfully.</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleId">Vehicle Identifier</Label>
                      <Input
                        id="vehicleId"
                        placeholder="e.g. V-1001"
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity Level</Label>
                      <Select
                        id="severity"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <option value="low">Low (Routine maintenance)</option>
                        <option value="medium">Medium (Requires attention)</option>
                        <option value="critical">Critical (Immediate action required)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Maintenance Description / Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Describe the issue or required work..."
                      rows={3}
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-6">
                  <span className="text-xs text-slate-500">All fields are required.</span>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ vehicleId: "", reason: "", severity: "low" })}
                    >
                      Clear
                    </Button>
                    <Button type="submit" isLoading={loading}>
                      Log Record
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Theme Tokens</CardTitle>
                <CardDescription>Standard styling principles applied to these components.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-6 w-6 rounded bg-slate-900 border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800">Slate Neutral</p>
                    <p className="text-xs text-slate-500">Core UI text and fills</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-6 w-6 rounded bg-sky-500 border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800">Sky Focus Ring</p>
                    <p className="text-xs text-slate-500">Accents and active focus rings</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-6 w-6 rounded bg-slate-50 border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800">Card & Page Fills</p>
                    <p className="text-xs text-slate-500">Light slate backgrounds</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-6 w-6 rounded bg-emerald-50 border border-emerald-200" />
                  <div>
                    <p className="font-semibold text-slate-850">Success / Available</p>
                    <p className="text-xs text-slate-500">Green soft badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Relative Imports:</strong> Since paths are not mapped via TypeScript aliases, import files using relative imports:
                </p>
                <code className="block bg-slate-100 p-2 rounded text-[10px] text-slate-800">
                  import {"{"} Button {"}"} from "../../components/ui/button";
                </code>
                <p>
                  <strong>Class Merging:</strong> Extend styles dynamically:
                </p>
                <code className="block bg-slate-100 p-2 rounded text-[10px] text-slate-800">
                  {"<Button className=\"mt-4 w-full\" />"}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
