import React from "reactn";
import { config } from "../firebase";
import { Image } from "./common/Image";

const UserLayout = (props) => {
  return (
    <div className="h-[50px] px-4 flex items-center justify-between bg-whiteDark">
      <div>
        <Image
          src={`${config.storageUrl}/resources/ebombo-icon.png`}
          width="125px"
          height="35px"
          size="contain"
          margin="0"
        />
      </div>
    </div>
  );
};

export default UserLayout;
