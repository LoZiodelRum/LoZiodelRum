import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegisterModal({ open, onClose }: Props) {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  if (!open) return null;

  const validForm =
    nome.trim() &&
    cognome.trim() &&
    username.trim() &&
    telefono.trim() &&
    email.trim() &&
    password.length >= 6 &&
    password === confirmPassword &&
    usernameAvailable === true;

  async function checkUsername(val: string) {
    setUsername(val);
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const { data } = await supabase
      .from("Profili")
      .select("id")
      .eq("username", val)
      .maybeSingle();
    setUsernameAvailable(!data);
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError || !authData.user) {
      setMsg(authError?.message || "Errore registrazione");
      setLoading(false);
      return;
    }
    const userId = authData.user.id;
    let avatar_url = "";
    }
    // ...resto della funzione handleSubmit...
    // (nessun return qui, il return del componente è fuori da handleSubmit)
}
