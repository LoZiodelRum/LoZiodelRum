import "../App.css";
import { motion } from "framer-motion";
import {
  Award,
  Beaker,
  BookOpen,
  CalendarDays,
  Circle,
  Flame,
  MessageSquareText,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";
import BarettoPreview from "../components/BarettoPreview";

export default function Community() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/baretto", { replace: true }); }, [navigate]);
  return null;
}