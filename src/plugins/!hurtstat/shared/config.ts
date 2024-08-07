import * as alt from 'alt-client';

export const bodyPartToBoneId = {
    0: 0x2e28, // Pelvis -> SKEL_Pelvis
    1: 0xe39f, // LeftHip -> SKEL_L_Thigh
    2: 0xf9bb, // LeftLeg -> SKEL_L_Calf
    3: 0x3779, // LeftFoot -> SKEL_L_Foot
    4: 0xca72, // RightHip -> SKEL_R_Thigh
    5: 0x9000, // RightLeg -> SKEL_R_Calf
    6: 0xcc4d, // RightFoot -> SKEL_R_Foot
    7: 0xe0fd, // LowerTorso -> SKEL_Spine_Root
    8: 0x60f0, // UpperTorso -> SKEL_Spine1
    9: 0x60f0, // Chest -> SKEL_Spine1
    10: 0x9995, // UnderNeck -> SKEL_Neck_1
    11: 0xfcd9, // LeftShoulder -> SKEL_L_Clavicle
    12: 0xb1c5, // LeftUpperArm -> SKEL_L_UpperArm
    13: 0xeeeb, // LeftElbow -> SKEL_L_Forearm
    14: 0x49d9, // LeftWrist -> SKEL_L_Hand
    15: 0x29d2, // RightShoulder -> SKEL_R_Clavicle
    16: 0x9d4d, // RightUpperArm -> SKEL_R_UpperArm
    17: 0x6e5c, // RightElbow -> SKEL_R_Forearm
    18: 0xdead, // RightWrist -> SKEL_R_Hand
    19: 0x9995, // Neck -> SKEL_Neck_1
    20: 0x796e  // Head -> SKEL_Head
};
