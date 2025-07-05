import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Github, BookText } from "lucide-react";
import { authorizeToolkit } from '@/app/api/integrations';
import { useAuth } from '@/app/auth/authContext';

const integrationsList = [
    { name: "GitHub", icon: <Github className="h-6 w-6" />, connected: false },
    { name: "Notion", icon: <BookText className="h-6 w-6" />, connected: false },
];

export function IntegrationsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [integrations, setIntegrations] = useState(integrationsList);

    const handleToggleConnection = async (name: string) => {
        const integration = integrations.find(int => int.name === name);
        if (!integration) return;

        if (integration.connected) {
            // In a real application, you would make an API call to your backend
            // to properly disconnect the integration and handle any cleanup.
            console.log(`TODO: Implement backend disconnection for ${name}`);
            setIntegrations(prev =>
                prev.map(int =>
                    int.name === name ? { ...int, connected: false } : int
                )
            );
        } else {
            // The user wants to connect this integration.
            const toolkit = name.toLowerCase();
            if (!token) {
                console.error("Authentication token not found.");
                // Optionally, show a toast to the user.
                return;
            }
            try {
                const { redirect_url } = await authorizeToolkit(toolkit, token);
                
                // Open a new window for the user to go through the authorization process.
                window.open(redirect_url, '_blank', 'noopener,noreferrer');

                // For a better user experience, we can optimistically update the UI.
                // This assumes the user will successfully complete the authorization.
                // A more robust solution would involve waiting for a callback from the backend
                // (e.g., via WebSockets or polling) to confirm the connection status.
                setIntegrations(prev =>
                    prev.map(int =>
                        int.name === name ? { ...int, connected: true } : int
                    )
                );
            } catch (error) {
                console.error('Failed to get authorization URL', error);
                // Here you might want to show a toast to the user
            }
        }
    };

    const filteredIntegrations = integrations.filter((integration) =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Add integrations</DialogTitle>
                </DialogHeader>
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="space-y-2">
                        {filteredIntegrations.map((integration, index) => (
                            <motion.div
                                key={integration.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {integration.icon}
                                    <span className="font-medium">{integration.name}</span>
                                </div>
                                <Button
                                    variant={integration.connected ? "outline" : "default"}
                                    onClick={() => handleToggleConnection(integration.name)}
                                >
                                    {integration.connected ? "Disconnect" : "Connect"}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 