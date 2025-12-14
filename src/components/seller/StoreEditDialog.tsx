import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface StoreEditDialogProps {
  store: {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
  } | null;
}

export function StoreEditDialog({ store }: StoreEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(store?.name || "");
  const [description, setDescription] = useState(store?.description || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!store?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ 
          name, 
          description,
          updated_at: new Date().toISOString()
        })
        .eq("id", store.id);

      if (error) throw error;

      toast({
        title: "Tienda actualizada",
        description: "Los detalles de tu tienda han sido guardados.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["store"] });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating store:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tienda. Inténtalo de nuevo.",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#071d7f]">Editar Información de la Tienda</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              Nombre Comercial
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Nombre de tu tienda"
            />
            <p className="text-xs text-gray-500">
              Este es el nombre que verán tus clientes.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">
              Descripción Pública
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="Describe tu negocio, productos y servicios..."
            />
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
