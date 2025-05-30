"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Upload, Camera, AlertCircle, Building2, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  idType: "passport" | "citizenship" | "driving-license" | "";
  frontImage: string | null;
  panCardImage: string | null;
  avatar: string | null;
  bankDetails: {
    accountNumber: string;
    bankName: string;
    bankAddress: string;
    accountHolderName: string;
    panId: string;
  };
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
    state: user?.state || "",
    city: user?.city || "",
    address: user?.address || "",
    idType: user?.idType || "",
    frontImage: user?.frontImage || null,
    panCardImage: user?.panCardImage || null,
    avatar: user?.avatar || null,
    bankDetails: user?.bankDetails || {
      accountNumber: "",
      bankName: "",
      bankAddress: "",
      accountHolderName: "",
      panId: "",
    },
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (type: "front" | "pan") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "front") {
          setProfileData(prev => ({ ...prev, frontImage: reader.result as string }));
        } else {
          setProfileData(prev => ({ ...prev, panCardImage: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.panCardImage) {
      toast.error("PAN Card is required");
      return;
    }

    if (!profileData.idType) {
      toast.error("Please select an ID type");
      return;
    }

    if (profileData.idType && !profileData.frontImage) {
      toast.error("Front image of the selected ID is required");
      return;
    }

    if (!profileData.bankDetails.accountNumber || 
        !profileData.bankDetails.bankName || 
        !profileData.bankDetails.accountHolderName || 
        !profileData.bankDetails.panId) {
      toast.error("Please fill in all required bank details");
      return;
    }

    try {
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.avatar || undefined} />
                <AvatarFallback className="text-4xl">
                  {profileData.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new profile picture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  placeholder="Enter your country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State/Province</label>
                <Input
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  placeholder="Enter your state/province"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="Enter your city"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Holder's Name</label>
                <Input
                  value={profileData.bankDetails.accountHolderName}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    bankDetails: {
                      ...profileData.bankDetails,
                      accountHolderName: e.target.value
                    }
                  })}
                  placeholder="Enter account holder's name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <Input
                  value={profileData.bankDetails.accountNumber}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    bankDetails: {
                      ...profileData.bankDetails,
                      accountNumber: e.target.value
                    }
                  })}
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name</label>
                <Input
                  value={profileData.bankDetails.bankName}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    bankDetails: {
                      ...profileData.bankDetails,
                      bankName: e.target.value
                    }
                  })}
                  placeholder="Enter bank name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PAN ID</label>
                <Input
                  value={profileData.bankDetails.panId}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    bankDetails: {
                      ...profileData.bankDetails,
                      panId: e.target.value.toUpperCase()
                    }
                  })}
                  placeholder="Enter PAN ID"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Bank Address</label>
                <Input
                  value={profileData.bankDetails.bankAddress}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    bankDetails: {
                      ...profileData.bankDetails,
                      bankAddress: e.target.value
                    }
                  })}
                  placeholder="Enter bank address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identification Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">PAN Card is required</p>
              </div>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload("pan")}
                />
                <div className="border rounded-lg p-4">
                  {profileData.panCardImage ? (
                    <div className="relative">
                      <img
                        src={profileData.panCardImage}
                        alt="PAN Card"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileData({ ...profileData, panCardImage: null });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-muted rounded hover:bg-muted/80 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-primary hover:underline">Upload PAN Card</span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional ID Type (Required)</label>
                <Select
                  value={profileData.idType}
                  onValueChange={(value: "passport" | "citizenship" | "driving-license") => 
                    setProfileData({ ...profileData, idType: value, frontImage: null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="citizenship">Citizenship</SelectItem>
                    <SelectItem value="driving-license">Driving License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profileData.idType && (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload("front")}
                  />
                  <div className="border rounded-lg p-4">
                    {profileData.frontImage ? (
                      <div className="relative">
                        <img
                          src={profileData.frontImage}
                          alt="ID Front"
                          className="w-full h-48 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileData({ ...profileData, frontImage: null });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 bg-muted rounded hover:bg-muted/80 transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-primary hover:underline">
                          Upload {profileData.idType === "passport" ? "Passport" : 
                                profileData.idType === "driving-license" ? "Driving License" :
                                "Citizenship"} Front
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}