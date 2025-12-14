import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UserEditDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function UserEditDialog({ user }: UserEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Update user metadata in Supabase Auth (if possible) or a profiles table
      // Assuming we have a profiles table or similar, but usually name is in auth.users metadata
      // For this example, we'll try to update the auth metadata
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido guardada.",
      });
      
      // Invalidate auth query to refresh user data
      // Note: This might require a page reload or context update depending on implementation
      window.location.reload(); 
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-[#071d7f] border-blue-200 hover:bg-blue-50">
            <Edit className="h-4 w-4 mr-2" />
            Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#071d7f]">Editar Información Personal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-right">
              Nombre Completo
            </Label>
            <Input
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Tu nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userEmail" className="text-right">
              Email
            </Label>
            <Input
              id="userEmail"
              value={user?.email || ""}
              disabled
              className="col-span-3 bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              El email no se puede cambiar directamente.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#071d7f] hover:bg-[#051560]">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
