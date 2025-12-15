import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Facebook, Instagram, Phone, Video, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface StoreEditDialogProps {
  store: {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    banner: string | null;
    metadata: any;
  } | null;
}

const COUNTRIES = [
  { code: "CO", name: "Colombia", currency: "COP" },
  { code: "MX", name: "México", currency: "MXN" },
  { code: "AR", name: "Argentina", currency: "ARS" },
  { code: "CL", name: "Chile", currency: "CLP" },
  { code: "PE", name: "Perú", currency: "PEN" },
  { code: "US", name: "Estados Unidos", currency: "USD" },
  { code: "ES", name: "España", currency: "EUR" },
  { code: "OT", name: "Otro", currency: "USD" }
];

export function StoreEditDialog({ store }: StoreEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(store?.name || "");
  const [description, setDescription] = useState(store?.description || "");
  const [country, setCountry] = useState(store?.metadata?.country || "CO");

  // Social Media State
  const [facebook, setFacebook] = useState(store?.metadata?.social?.facebook || "");
  const [instagram, setInstagram] = useState(store?.metadata?.social?.instagram || "");
  const [whatsapp, setWhatsapp] = useState(store?.metadata?.social?.whatsapp || "");
  const [tiktok, setTiktok] = useState(store?.metadata?.social?.tiktok || "");

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
          metadata: {
            ...store.metadata,
            country,
            social: {
              facebook,
              instagram,
              whatsapp,
              tiktok
            }
          },
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="country" className="text-right">
              País / Ubicación
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name} ({c.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Ayuda a calcular las estadísticas de ventas en tu moneda local.
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
              className="col-span-3 min-h-[100px]"
              placeholder="Describe tu negocio, productos y servicios..."
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900">Redes Sociales</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                    </Label>
                    <Input
                        id="facebook"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="URL de Facebook"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" /> Instagram
                    </Label>
                    <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="URL de Instagram"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" /> WhatsApp
                    </Label>
                    <Input
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Número (ej: +57...)"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tiktok" className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-black" /> TikTok
                    </Label>
                    <Input
                        id="tiktok"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="URL de TikTok"
                    />
                </div>
            </div>
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
