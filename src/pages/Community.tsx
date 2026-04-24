import Navbar from "../components/Navbar";
import React from "react";
import BarettoPreview from "../components/BarettoPreview";

export default function Community() {
  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Community</h1>
        <BarettoPreview />
      </div>
    </>
  );
}
