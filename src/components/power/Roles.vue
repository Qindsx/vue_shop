<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'venter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'venter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="40%"
      @close="addDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="reightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  所有角色列表数据
      roleList: [],
      //   控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 2,
            max: 8,
            message: "用户名长度在 2 到 8 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "密码长度在 2 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      //   控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      //   修改对话框的验证规则
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 2,
            max: 8,
            message: "用户名长度在 2 到 8 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "密码长度在 2 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      //   控制分配权限对话框的显示与隐藏
      setRightDialogDialogVisible: false,
      //   所有权限的数据
      reightsList: [],
    //    树形控件的属性绑定对象
        treeProps: {
            label: 'authName',
            children: 'children'
        },
        // 默认选中的节点id值
        defkeys: [ 
        ],
        // 即将分配权限的角色id
        roleId: ''
    };
  },
  created() {
    // 获取所有角色列表数据
    this.getRolesList();
  },
  methods: {
    // 获取所有角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      console.log(this.roleList);
    },
    // 监听添加用户对话框给的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //   添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        //   发起添加角色的请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 隐藏添加角色的对话框
        this.addDialogVisible = false;
        // 重新获取角色列表
        this.getRolesList();
      });
    },
    //   展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo() {
      console.log(this.editForm);
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        // 发起修改角色信息的请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status != 200) {
          return this.$message.error("更新用户角色信息失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getRolesList();
        // 提示修改成功
        this.$message.success("修改用户信息成功");
      });
    },
    //   根据Id删除对应的用户信息
    async removeUserById(id) {
      // 确认是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 如果用户确认删除，返回字符串confirm
      // 如果用户取消删除，返回字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消删除");
      }
      // 发送删除请求
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败");
      }
      this.$message.success("删除角色成功");
      this.getRolesList();
    },
    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      // 弹框提示是否删除
      const congfirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (congfirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }

      //   发起删除角色权限请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }

      // 服务器接受删除请求后返回的是已经删除的权限列表，只需重新赋值即可，不用重新渲染列表
      role.children = res.data;
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
        this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        this.$message.error("获取权限数据失败");
      }
      //  将获取到的权限数据保存到data
      this.reightsList = res.data;

    //   递归获取三级节点的id
    this.getLeafKeys(role, this.defkeys)
      this.setRightDialogDialogVisible = true;
    },
    // 使用递归函数，获取角色下所有的三级权限的id，并保存到defKeys中
    getLeafKeys(node, arr) {
        // 判断当前node节点不包含children属性，则是三级节点
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item => {
            this.getLeafKeys(item, arr)
        });
    },
    // 监听分配权限对话框的关闭事件，清空上一次打开的权限数据
    setRightDialogClosed() {
        this.defkeys = []
    },
    // 点击为角色分配id
    async allotRights() {
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')

        const {data : res} = await this.$http.post(`roles/${this.roleId}/rights`, { rids : idStr})
        if(res.meta.status !== 200) {
            return this.$message.erroe('分配权限成功')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogDialogVisible = false
    }
  }
};
</script>

<style scope>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.venter {
  display: flex;
  align-items: center;
}
</style>
