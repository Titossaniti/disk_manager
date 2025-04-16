import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your dashboard. Here's an overview of your account.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>Total number of registered users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">1,234</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Active Projects</CardTitle>
                        <CardDescription>Projects currently in progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">42</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Revenue</CardTitle>
                        <CardDescription>Total revenue this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$12,345</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
