import type { Listing } from "../types";

export const SEED_LISTINGS: Omit<Listing, "status">[] = [
  { id: 1, title: "2024 Range Rover Sport", make: "Land Rover", model: "Range Rover Sport", price: 485000, location: "Abu Dhabi", category: "motors", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", verified: true, date: 1, description: "Brand new, full warranty, panoramic roof, premium package." },
  { id: 2, title: "BMW M4 Competition 2023", make: "BMW", model: "M4", price: 385000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", verified: true, date: 3, description: "Low mileage, carbon package, agency maintained." },
  { id: 3, title: "Toyota Land Cruiser 2022", make: "Toyota", model: "Land Cruiser", price: 295000, location: "Sharjah", category: "motors", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800", verified: false, date: 4, description: "GXR, single owner, GCC specs, full service history." },
  { id: 4, title: "Mercedes-Benz G63 AMG 2023", make: "Mercedes-Benz", model: "G63 AMG", price: 945000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800", verified: true, date: 2, description: "Brabus pack, night package, full options, GCC." },
  { id: 5, title: "Porsche 911 Carrera S 2022", make: "Porsche", model: "911", price: 525000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", verified: true, date: 6, description: "Sport Chrono, PASM, agency maintained, GCC specs." },
  { id: 6, title: "Audi RS6 Avant 2023", make: "Audi", model: "RS6", price: 575000, location: "Abu Dhabi", category: "motors", img: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800", verified: true, date: 5, description: "Carbon ceramics, dynamic plus, premium sound." },
  { id: 7, title: "Nissan Patrol Platinum 2023", make: "Nissan", model: "Patrol", price: 295000, location: "Sharjah", category: "motors", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", verified: false, date: 7, description: "V8 5.6L, full options, 7-seater, single owner." },
  { id: 8, title: "Lexus LX 600 2023", make: "Lexus", model: "LX 600", price: 615000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", verified: true, date: 4, description: "F-Sport, Mark Levinson, head-up display, GCC." },
  { id: 9, title: "Ford Mustang GT 2022", make: "Ford", model: "Mustang", price: 165000, location: "Ajman", category: "motors", img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", verified: false, date: 8, description: "5.0L V8, performance pack, recaro seats." },
  { id: 10, title: "Tesla Model Y Long Range 2024", make: "Tesla", model: "Model Y", price: 215000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800", verified: true, date: 1, description: "Autopilot, 7-seater, low mileage, full warranty." },
  { id: 11, title: "Chevrolet Corvette C8 2023", make: "Chevrolet", model: "Corvette", price: 425000, location: "Dubai", category: "motors", img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800", verified: true, date: 9, description: "Z51 package, magnetic ride control, carbon trim." },
  { id: 12, title: "Toyota Hilux Adventure 2023", make: "Toyota", model: "Hilux", price: 145000, location: "Sharjah", category: "motors", img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800", verified: false, date: 5, description: "4x4, double cab, diesel, dealer warranty." },
  { id: 13, title: "iPhone 15 Pro Max 256GB", price: 4800, location: "Abu Dhabi", category: "classifieds", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", verified: true, date: 2, description: "Sealed box, UAE warranty." },
  // Additional UAE emirates
  { id: 14, title: "Nissan X-Trail 2023", make: "Nissan", model: "X-Trail", price: 125000, location: "Ras Al Khaimah", category: "motors", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", verified: true, date: 3, description: "Family SUV, GCC specs, full service history." },
  { id: 15, title: "Toyota Yaris 2022", make: "Toyota", model: "Yaris", price: 52000, location: "Fujairah", category: "motors", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", verified: false, date: 6, description: "Economical city car, single owner." },
  { id: 16, title: "Hyundai Tucson 2023", make: "Hyundai", model: "Tucson", price: 98000, location: "Umm Al Quwain", category: "motors", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", verified: true, date: 4, description: "Panoramic roof, under warranty." },
  { id: 17, title: "Kia Sportage 2024", make: "Kia", model: "Sportage", price: 112000, location: "Al Ain", category: "motors", img: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800", verified: true, date: 2, description: "Dealer warranty, low mileage." },
  // Other countries (location = country name for footer filters)
  { id: 18, title: "BMW 520i 2022", make: "BMW", model: "5 Series", price: 210000, location: "Egypt", category: "motors", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", verified: true, date: 5, description: "Cairo listing — agency maintained." },
  { id: 19, title: "Toyota Camry 2023", make: "Toyota", model: "Camry", price: 95000, location: "Bahrain", category: "motors", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", verified: true, date: 3, description: "Manama — GCC specs." },
  { id: 20, title: "Lexus RX 350 2023", make: "Lexus", model: "RX", price: 285000, location: "Saudi Arabia", category: "motors", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", verified: true, date: 2, description: "Riyadh — full options." },
  { id: 21, title: "Mercedes-Benz C200 2022", make: "Mercedes-Benz", model: "C-Class", price: 145000, location: "Kuwait", category: "motors", img: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800", verified: false, date: 7, description: "Kuwait City — clean title." },
  { id: 22, title: "Nissan Patrol 2021", make: "Nissan", model: "Patrol", price: 175000, location: "Oman", category: "motors", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800", verified: true, date: 4, description: "Muscat — 4x4 ready." },
  { id: 23, title: "Porsche Cayenne 2022", make: "Porsche", model: "Cayenne", price: 320000, location: "Qatar", category: "motors", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800", verified: true, date: 1, description: "Doha — premium package." },
];

export function seededListings(): Listing[] {
  return SEED_LISTINGS.map((l, i) => {
    // Alternate between demo dealers so chat has real account counterparts
    const dealer = i % 3 === 0
      ? { ownerId: "dealer-2", ownerName: "Premium Motors LLC" }
      : { ownerId: "dealer-1", ownerName: "Ahmed Al Mansoori" };
    return {
      ...l,
      status: "approved" as const,
      ...dealer,
    };
  });
}
