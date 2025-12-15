import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Upload, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserEditDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
  isVerified?: boolean;
}

export function UserEditDialog({ user, isVerified = false }: UserEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Imagen subida",
        description: "Recuerda guardar los cambios.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Update user metadata in Supabase Auth
      const updateData: { full_name?: string; avatar_url?: string } = {};
      
      // Only update name if not verified
      if (!isVerified) {
        updateData.full_name = name;
      }
      
      // Avatar can always be updated
      if (avatarUrl !== user?.avatar_url) {
        updateData.avatar_url = avatarUrl;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: updateData
      });

      if (authError) throw authError;

      // Also update the profiles table
      const profileUpdate: { full_name?: string; avatar_url?: string } = {};
      if (!isVerified) {
        profileUpdate.full_name = name;
      }
      if (avatarUrl !== user?.avatar_url) {
        profileUpdate.avatar_url = avatarUrl;
      }

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido guardada.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["auth"] });
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
        
        {isVerified && (
          <Alert className="bg-amber-50 border-amber-200">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Tu cuenta está verificada. Solo puedes cambiar tu foto de perfil. Para modificar otros datos, contacta a soporte.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 py-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-blue-100">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-blue-50 text-[#071d7f] text-2xl">
                {name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-[#071d7f] border-blue-200 hover:bg-blue-50"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Cambiar Foto
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Nombre Completo</Label>
            <Input
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isVerified}
              className={isVerified ? "bg-gray-100 cursor-not-allowed" : ""}
              placeholder="Tu nombre completo"
            />
            {isVerified && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Campo bloqueado por verificación
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              value={user?.email || ""}
              disabled
              className="bg-gray-100 cursor-not-allowed"
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
