"use client";

import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BiLoaderCircle } from "react-icons/bi";
import TextInput from "../TextInput";
import { useUser } from "@/app/context/user";
import { useProfileStore } from "@/app/stores/profile";
import { useGeneralStore } from "@/app/stores/general";
import useUpdateProfile from "@/app/hooks/useUpdateProfile";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import type { ShowErrorObject } from "@/app/types";

export default function EditProfileOverlay() {
  const { currentProfile, setCurrentProfile } = useProfileStore();
  const { setIsEditProfileOpen } = useGeneralStore();
  const contextUser = useUser();

  const [userName, setUserName] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userImage, setUserImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<ShowErrorObject | null>(null);

  useEffect(() => {
    setUserName(currentProfile?.name || "");
    setUserBio(currentProfile?.bio || "");
    setUserImage(currentProfile?.image || "");
  }, [currentProfile?.bio, currentProfile?.image, currentProfile?.name]);

  const showError = (type: string) => {
    if (error && error.type === type) {
      return error.message;
    }
    return "";
  };

  const validate = () => {
    setError(null);
    if (!userName.trim()) {
      setError({ type: "userName", message: "A name is required." });
      return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (validate()) return;
    if (!contextUser?.user?.id) return;

    try {
      setIsUpdating(true);
      await useUpdateProfile(
        contextUser.user.id,
        userName.trim(),
        userBio.trim(),
        userImage.trim() || undefined,
      );
      await contextUser.refreshProfile();
      setCurrentProfile(contextUser.user.id);
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      id="EditProfileOverlay"
      className="fixed flex justify-center pt-14 md:pt-[105px] z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 overflow-auto"
    >
      <div className="relative bg-white w-full max-w-[700px] h-[600px] mx-3 p-4 rounded-lg mb-10">
        <div className="absolute flex items-center justify-between w-full p-5 left-0 top-0 border-b border-b-gray-300">
          <h1 className="text-[22px] font-medium">Edit profile</h1>
          <button
            disabled={isUpdating}
            onClick={() => setIsEditProfileOpen(false)}
            aria-label="Close edit profile"
            className="hover:bg-gray-200 p-1 rounded-full"
          >
            <AiOutlineClose size="25" />
          </button>
        </div>

        <div className="mt-16 space-y-6">
          <div className="flex flex-col border-b pb-4">
            <h3 className="font-semibold text-[15px] text-gray-700 mb-3">
              Profile photo
            </h3>
            <div className="flex items-center gap-4">
              <img
                className="rounded-full h-[72px] w-[72px] object-cover"
                src={useCreateBucketUrl(userImage)}
                alt="Profile preview"
              />
              <div className="flex-1">
                <TextInput
                  string={userImage}
                  placeholder="Paste an image URL"
                  onUpdate={setUserImage}
                  inputType="text"
                  error={showError("userImage")}
                />
                <p className="text-[11px] text-gray-500 mt-2">
                  Use a hosted image URL to update your profile photo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col border-b pb-4">
            <h3 className="font-semibold text-[15px] text-gray-700 mb-3">Name</h3>
            <TextInput
              string={userName}
              placeholder="Creator name"
              onUpdate={setUserName}
              inputType="text"
              error={showError("userName")}
            />
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-[15px] text-gray-700 mb-3">Bio</h3>
            <textarea
              cols={30}
              rows={4}
              onChange={(event) => setUserBio(event.target.value)}
              value={userBio}
              maxLength={120}
              className="
                resize-none
                w-full
                bg-[#F1F1F2]
                text-gray-800
                border
                border-gray-300
                rounded-md
                py-2.5
                px-3
                focus:outline-none
              "
            />
            <p className="text-[11px] text-gray-500 mt-1">
              {userBio.length}/120
            </p>
          </div>
        </div>

        <div className="absolute p-5 left-0 bottom-0 border-t border-t-gray-300 w-full flex items-center justify-end">
          <button
            disabled={isUpdating}
            onClick={() => setIsEditProfileOpen(false)}
            className="flex items-center border rounded-sm px-3 py-[6px] hover:bg-gray-100"
          >
            <span className="px-2 font-medium text-[15px]">Cancel</span>
          </button>

          <button
            disabled={isUpdating}
            onClick={() => void handleSave()}
            className="flex items-center bg-[#F02C56] text-white border rounded-md ml-3 px-3 py-[6px]"
          >
            <span className="mx-4 font-medium text-[15px]">
              {isUpdating ? (
                <BiLoaderCircle
                  color="#ffffff"
                  className="my-1 mx-2.5 animate-spin"
                />
              ) : (
                "Save"
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
