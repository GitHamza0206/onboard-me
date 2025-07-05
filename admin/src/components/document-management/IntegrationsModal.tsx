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
    const [searchTerm, setSearchTerm] = useState("");
    const [integrations, setIntegrations] = useState(integrationsList);

    const handleToggleConnection = (name: string) => {
        setIntegrations(prev =>
            prev.map(int =>
                int.name === name ? { ...int, connected: !int.connected } : int
            )
        );
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