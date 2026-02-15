/**
 * Autocomplete / Creatable Select per il campo "Locale dove lavora".
 * Permette di scegliere un locale esistente o di scriverne uno nuovo.
 */
import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function VenueCombobox({
  venues = [],
  value, // { venue_id: string, venue_name: string } - venue_id per esistente, venue_name per custom
  onChange,
  placeholder = "Cerca o scrivi un locale...",
  className,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const selectedVenue = value?.venue_id ? venues.find((v) => v.id === value.venue_id) : null;
  const displayValue = selectedVenue
    ? `${selectedVenue.name} — ${selectedVenue.city}`
    : value?.venue_name || "";

  const filteredVenues = venues.filter(
    (v) =>
      !inputValue ||
      v.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
      v.city?.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = venues.some(
    (v) => v.name?.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const canCreate = inputValue.trim().length > 0 && !exactMatch;

  useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  const handleSelect = (venue) => {
    onChange({ venue_id: venue.id, venue_name: "" });
    setOpen(false);
  };

  const handleCreate = () => {
    const name = inputValue.trim();
    if (name) {
      onChange({ venue_id: "", venue_name: name });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-10 bg-stone-900 border-stone-700 hover:bg-stone-800",
            !displayValue && "text-stone-500",
            error && "border-red-500/50",
            className
          )}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-stone-900 border-stone-800" align="start">
        <Command className="bg-stone-900" shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Cerca per nome o città..."
            value={inputValue}
            onValueChange={setInputValue}
            className="border-stone-700"
          />
          <CommandList>
            {filteredVenues.length > 0 ? (
              <>
                <CommandGroup>
                  {filteredVenues.map((venue) => (
                    <CommandItem
                      key={venue.id}
                      value={`${venue.id}`}
                      onSelect={() => handleSelect(venue)}
                      className="text-stone-200 hover:bg-stone-800"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.venue_id === venue.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{venue.name}</span>
                      <span className="ml-2 text-stone-500">— {venue.city}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {canCreate && (
                  <CommandGroup>
                    <CommandItem
                      value="__create__"
                      onSelect={handleCreate}
                      className="text-amber-400 hover:bg-stone-800 border-t border-stone-800"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi &quot;{inputValue.trim()}&quot; come nuovo locale
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            ) : (
              <div className="py-4 px-2">
                {canCreate ? (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex w-full items-center gap-2 px-2 py-2.5 text-sm text-amber-400 hover:bg-stone-800 rounded-sm cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Aggiungi &quot;{inputValue.trim()}&quot; come nuovo locale
                  </button>
                ) : (
                  <span className="block text-center text-sm text-stone-500">
                    Nessun locale trovato. Scrivi per aggiungerne uno nuovo.
                  </span>
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
