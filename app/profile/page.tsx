'use client';


import { createBankDetails, getBankDetails } from "@/api/bank";
import { useEffect } from "react";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { User } from "@/lib/types";
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
import { UserCog, Upload, Camera, AlertCircle, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



interface BankDetailsPayload {
  name: string;
  address: string;
  acName: string;
  acNumber: string;
  tax: string;
  userId: string;
  branch: string;                 
  additionalInformation: string; 
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
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
    branch?: string | null;
    additionalInformation?: string | null;
  };
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
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

  useEffect(() => {
      if (user) {
        // Set basic profile info first
        setProfileData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          idType: user.idType || "",
          frontImage: user.frontImage || null,
          panCardImage: user.panCardImage || null,
          avatar: user.avatar || null,
        }));
  
        
      }
    }, [user]);

  const [editingSection, setEditingSection] = useState<'personal' | 'bank' | 'documents' | 'avatar' | null>(null);
  const [isAdding, setIsAdding] = useState<'personal' | 'bank' | 'documents' | 'avatar' | null>(null);

  useEffect(() => {
    if (user?.id) {
      getBankDetails(Number(user.id))
        .then((data) => {
          if (data) {
            setProfileData((prev) => ({
              ...prev,
              bankDetails: {
                accountHolderName: data.acName,
                accountNumber: data.acNumber,
                bankName: data.name,
                panId: data.tax,
                bankAddress: data.address,
                branch: data.branch || "Nothing",
                additionalInformation: data.additionalInformation || "Nothing",
              },
            }));
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch bank details");
          console.error(error);
        });
    }
  }, [user]);

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
        toast.success("Profile picture updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (type: "front" | "pan") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "front") {
          setProfileData(prev => ({ ...prev, frontImage: reader.result as string }));
          toast.success("ID document uploaded successfully");
        } else {
          setProfileData(prev => ({ ...prev, panCardImage: reader.result as string }));
          toast.success("PAN Card uploaded successfully");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on which section is being edited/added
    // if (editingSection === 'personal' || isAdding === 'personal') {
    //   if (!profileData.name || !profileData.email || !profileData.phone || !profileData.address) {
    //     toast.error("Please fill in all required personal information");
    //     return;
    //   }
    // }

    if (editingSection === 'personal' || isAdding === 'personal') {
      if (!profileData.name || !profileData.email || !profileData.phone || !profileData.address) {
        toast.error("Please fill in all required personal information");
        return;
      }

      try {
        const payload = {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,

        };


        await updateProfile(payload);

        setEditingSection(null);
        setIsAdding(null);
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile");
      }
    }


    // if (editingSection === 'bank' || isAdding === 'bank') {
    //   if (!profileData.bankDetails.accountNumber ||
    //     !profileData.bankDetails.bankName ||
    //     !profileData.bankDetails.accountHolderName ||
    //     !profileData.bankDetails.panId ||
    //     !profileData.bankDetails.bankAddress) {
    //     toast.error("Please fill in all required bank details");
    //     return;
    //   }
    // }

    if (editingSection === 'bank' || isAdding === 'bank') {
      const bank = profileData.bankDetails;
      if (!bank.accountNumber || !bank.bankName || !bank.accountHolderName || !bank.panId || !bank.bankAddress) {
        toast.error("Please fill in all required bank details");
        return;
      }

      if (isAdding === 'bank') {
        if (!user?.id) {
          toast.error("User ID is missing. Cannot add bank details.");
          return;
        }
        const payload: BankDetailsPayload = {
          name: profileData.bankDetails.bankName,
          address: profileData.bankDetails.bankAddress,
          acName: profileData.bankDetails.accountHolderName,
          acNumber: profileData.bankDetails.accountNumber,
          tax: profileData.bankDetails.panId,
          userId: user.id,
          branch: "Nothing",
          additionalInformation: "Nothing"
        };


        try {
          await createBankDetails(payload);
          toast.success("Bank details added successfully");
          setIsAdding(null);
          setEditingSection(null);
        } catch (err: any) {
          toast.error(err.message || "Failed to add bank details");
        }

        return;
      }
    }


    if (editingSection === 'personal' || isAdding === 'personal') {
      if (!profileData.name || !profileData.email || !profileData.phone || !profileData.address) {
        toast.error("Please fill in all required personal information");
        return;
      }
    }

    

    




    if (editingSection === 'documents' || isAdding === 'documents') {
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
    }

    try {
      await updateProfile({
        ...profileData,
        idType: profileData.idType as "passport" | "citizenship" | "driving-license",
      });
      setEditingSection(null);
      setIsAdding(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAction = (section: 'personal' | 'bank' | 'documents' | 'avatar', action: 'add' | 'update') => {
    if (action === 'add') {
      // Check if data already exists
      if (section === 'personal' && (profileData.name || profileData.email || profileData.phone || profileData.address)) {
        toast.error("Personal information already exists. Click Update to modify.");
        return;
      }
      if (section === 'bank' && (profileData.bankDetails.accountNumber || profileData.bankDetails.bankName)) {
        toast.error("Bank details already exist. Click Update to modify.");
        return;
      }
      if (section === 'documents' && (profileData.panCardImage || profileData.frontImage)) {
        toast.error("Documents already exist. Click Update to modify.");
        return;
      }
      if (section === 'avatar' && profileData.avatar) {
        toast.error("Profile picture already exists. Click Update to modify.");
        return;
      }
      setIsAdding(section);
      setEditingSection(null);
    } else {
      // Check if data exists before allowing update
      if (section === 'personal' && (!profileData.name && !profileData.email && !profileData.phone && !profileData.address)) {
        toast.error("No personal information exists. Please add new information first.");
        return;
      }
      if (section === 'bank' && (!profileData.bankDetails.accountNumber && !profileData.bankDetails.bankName)) {
        toast.error("No bank details exist. Please add new details first.");
        return;
      }
      if (section === 'documents' && !profileData.panCardImage && !profileData.frontImage) {
        toast.error("No documents exist. Please add new documents first.");
        return;
      }
      if (section === 'avatar' && !profileData.avatar) {
        toast.error("No profile picture exists. Please add a picture first.");
        return;
      }
      setEditingSection(section);
      setIsAdding(null);
    }
  };

  const getButtonLabel = (section: 'personal' | 'bank' | 'documents' | 'avatar') => {
    if (isAdding === section) return "Save New Info";
    if (editingSection === section) return "Savey Updates";
    return "Update";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <UserCog className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Picture</CardTitle>
            <div className="flex gap-2">
              {!editingSection && !isAdding && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleAction('avatar', 'add')}
                  >
                    Add New
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAction('avatar', 'update')}
                  >
                    {getButtonLabel('avatar')}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.avatar || undefined} />
                <AvatarFallback className="text-4xl">
                  {profileData.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(editingSection === 'avatar' || isAdding === 'avatar') && (
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={editingSection !== 'avatar' && isAdding !== 'avatar'}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new profile picture
            </p>
            {(editingSection === 'avatar' || isAdding === 'avatar') && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null);
                    setIsAdding(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isAdding === 'avatar' ? 'Save Updates' : 'Save New Updates'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <div className="flex gap-2">
              {!editingSection && !isAdding && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleAction('personal', 'add')}
                  >
                    Add New
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleAction('personal', 'update')}>
                    {getButtonLabel('personal')}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={editingSection !== 'personal' && isAdding !== 'personal'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                  disabled={editingSection !== 'personal' && isAdding !== 'personal'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  disabled={editingSection !== 'personal' && isAdding !== 'personal'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Address</label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Country, State, City, Street Address"
                  disabled={editingSection !== 'personal' && isAdding !== 'personal'}
                />
              </div>
            </div>
            {(editingSection === 'personal' || isAdding === 'personal') && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null);
                    setIsAdding(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isAdding === 'personal' ? 'Save Updates' : 'Save New Updates'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Details
            </CardTitle>
            <div className="flex gap-2">
              {!editingSection && !isAdding && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleAction('bank', 'add')}
                  >
                    Add New
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleAction('bank', 'update')}>
                    {getButtonLabel('bank')}
                  </Button>
                </>
              )}
            </div>
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
                  disabled={editingSection !== 'bank' && isAdding !== 'bank'}
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
                  disabled={editingSection !== 'bank' && isAdding !== 'bank'}
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
                  disabled={editingSection !== 'bank' && isAdding !== 'bank'}
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
                  disabled={editingSection !== 'bank' && isAdding !== 'bank'}
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
                  disabled={editingSection !== 'bank' && isAdding !== 'bank'}
                />
              </div>
            </div>
            {(editingSection === 'bank' || isAdding === 'bank') && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null);
                    setIsAdding(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isAdding === 'bank' ? 'Save New Bank Details' : 'Save Bank Updates'}
                </Button>

              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Identification Documents</CardTitle>
            <div className="flex gap-2">
              {!editingSection && !isAdding && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleAction('documents', 'add')}
                  >
                    Add New
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleAction('documents', 'update')}>
                    {getButtonLabel('documents')}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">PAN Card is required</p>
              </div>
              <label className={`block ${(editingSection !== 'documents' && isAdding !== 'documents') ? 'pointer-events-none' : 'cursor-pointer'}`}>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload("pan")}
                  disabled={editingSection !== 'documents' && isAdding !== 'documents'}
                />
                <div className="border rounded-lg p-4">
                  {profileData.panCardImage ? (
                    <div className="relative">
                      <img
                        src={profileData.panCardImage}
                        alt="PAN Card"
                        className="w-full h-48 object-cover rounded"
                      />
                      {(editingSection === 'documents' || isAdding === 'documents') && (
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
                      )}
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
                  disabled={editingSection !== 'documents' && isAdding !== 'documents'}
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
                <label className={`block ${(editingSection !== 'documents' && isAdding !== 'documents') ? 'pointer-events-none' : 'cursor-pointer'}`}>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload("front")}
                    disabled={editingSection !== 'documents' && isAdding !== 'documents'}
                  />
                  <div className="border rounded-lg p-4">
                    {profileData.frontImage ? (
                      <div className="relative">
                        <img
                          src={profileData.frontImage}
                          alt="ID Front"
                          className="w-full h-48 object-cover rounded"
                        />
                        {(editingSection === 'documents' || isAdding === 'documents') && (
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
                        )}
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
            {(editingSection === 'documents' || isAdding === 'documents') && (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSection(null);
                    setIsAdding(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isAdding === 'documents' ? 'Save Updates' : 'Save New Updates'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}